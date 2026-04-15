"""
Service dedicated to handling report generation.
"""
import logging
import json
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime, date

# Internal imports for utility and AI engine
from app.utils.pdf_creator import convert_markdown_to_pdf
from app.llm.llm_engine import LLMEngine
from app.core.settings import settings

# CRUD imports
from app.crud import (
    llm_services as crud_llm_services,
    investments as crud_investments,
    documents as crud_docs
)

# Schema imports
from app.schemas.llm_services import MessageCreate
from app.schemas.investments import DocumentCreate

# --- Configuration & Constants ---
logger = logging.getLogger(__name__)

# A list of text-readable file extensions
READABLE_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.txt', '.csv', '.json', '.xml', '.md', '.markdown', '.mdown'
]

# Path Constants
PROJECT_ROOT = Path(__file__).resolve().parents[4]
BACKEND_DIR_NAME = 'Backend'

# Report Generation Constants
TIMESTAMP_FORMAT = "%Y-%m-%d_%H%M%S"
REPORT_FILENAME_PREFIX = "ai_report_"
REPORT_DISPLAY_NAME_PREFIX = "AI Report - "
DOC_CONTENT_PREVIEW_LENGTH = 20000
DEFAULT_UPLOADER_ID = 1 

# LLM & Messaging Constants
ASSISTANT_ROLE = "assistant"
USER_ROLE = "user"
UI_STATUS_UPDATE_DELAY_SECONDS = 1.5  
SUMMARY_MESSAGE_TYPE = "report_summary"
REPORT_LINK_TEMPLATE = "/documents/document/{document_id}/download"

# UI Message Content
STATUS_DATA_GATHERED = """📊 I have gathered all the necessary data for the report.

|  ID   |  Name   |  Type   |
|-------|---------|---------|
| {id}  | {name}  | {type}  |
"""
STATUS_WRITING_REPORT = "I am now writing the full report. This is the longest step and may take a few minutes..."
STATUS_REPORT_SAVED = "The full report has been generated and saved. I am now creating the summary."
ERROR_MESSAGE_TEMPLATE = "I'm sorry, an error occurred while generating the report for '{}'."
GENERIC_ERROR_MESSAGE_TEMPLATE = "I'm sorry, an error occurred while generating the report for investment ID {}."
# --- End of Configuration ---


def model_to_dict(model_instance):
    """Helper to convert SQLAlchemy model to a dictionary, ensuring dates are strings."""
    if not model_instance:
        return {}
    
    d = {}
    for c in model_instance.__table__.columns:
        val = getattr(model_instance, c.name)
        if isinstance(val, (datetime, date)):
            d[c.name] = val.isoformat()
        else:
            d[c.name] = val
    return d


class ReportService:

    def __init__(self, engine: LLMEngine, db: AsyncSession):
        self.engine = engine
        self.db = db
        self.prompts = settings.PROMPTS_CONFIG
        self.report_template = self.prompts.get("report_template", "")
        self.summarize_template = self.prompts.get("summarize_report", "")
        if not self.report_template or not self.summarize_template:
            raise ValueError("Report or summary prompt templates are missing from the configuration.")

    async def _post_status_update(self, conversation_id: int, content: str):
        """Helper function to post a status update to the chat."""
        logger.info(f"Posting status to conversation {conversation_id}: {content}")
        status_message = MessageCreate(role=ASSISTANT_ROLE, content=content)
        await crud_llm_services.create_message(db=self.db, message=status_message, conversation_id=conversation_id)

    async def generate_report_and_summary(
        self,
        investment_id: int,
        conversation_id: int,
        **kwargs  # Accept and ignore extra keyword arguments to prevent crashes
    ):
        """
        Orchestrates the full report generation lifecycle with robust error handling.
        """
        investment_name = ""
        try:
            # 1. Fetch comprehensive data from the database.
            logger.info(f"Fetching comprehensive data for investment {investment_id}...")
            context_data = await self._get_comprehensive_investment_data(investment_id)
            
            investment = context_data.get("investment")
            if not investment:
                raise ValueError(f"Investment with ID {investment_id} not found.")

            # Store name for logging and filenames
            investment_name = investment.name
            
            # Post first status, then wait to create a delay for the UI.
            await self._post_status_update(
                conversation_id,
                STATUS_DATA_GATHERED.format(
                    id=investment.id,
                    name=investment.name,
                    type=investment.type
                )
            )

            await asyncio.sleep(UI_STATUS_UPDATE_DELAY_SECONDS)

            # 2. Format the fetched data into a detailed prompt using the template.
            full_prompt = self._format_data_for_prompt(context_data)

            # 3. Generate the full report text using the detailed prompt.
            await self._post_status_update(conversation_id, STATUS_WRITING_REPORT)
            logger.info(f"Generating full report for '{investment_name}'.")
            full_report_content = await self.engine.generate_response([{"role": USER_ROLE, "content": full_prompt}])
            
            if "error" in full_report_content.lower():
                raise ConnectionError(f"LLM service failed to generate the report content: {full_report_content}")

            # 4. Create a unique, timestamped name for the report.
            timestamp_str = datetime.now().strftime(TIMESTAMP_FORMAT)
            safe_name = investment_name.replace(" ", "_").lower()
            
            unique_filename = f"{REPORT_FILENAME_PREFIX}{safe_name}_{timestamp_str}.pdf"
            document_display_name = f"{REPORT_DISPLAY_NAME_PREFIX}{investment_name} - {timestamp_str}.pdf"

            # 5. Save the report content to a PDF file path.
            logger.info("Saving the full report to a PDF file...")
            pdf_path = self._save_report_as_pdf(full_report_content, investment_id, unique_filename)
            
            await self._post_status_update(conversation_id, STATUS_REPORT_SAVED)

            # 6. Create the final document record in the database.
            logger.info("Creating final document record in the database...")
            doc_schema = DocumentCreate(name=document_display_name)
            db_document = await crud_docs.create_document(
                db=self.db,
                document=doc_schema,
                investment_id=investment_id,
                uploaded_by_id=DEFAULT_UPLOADER_ID,
                file_location=str(pdf_path)
            )

            # 7. Ask LLM to summarize the full report using the template.
            logger.info("Summarizing the full report.")
            summary = await self._summarize_report(full_report_content)

            if "error" in summary.lower():
                raise ConnectionError(f"LLM service failed to summarize the report: {summary}")

            # 8. Inject final assistant message into chat.
            await self._inject_summary_into_chat(conversation_id, summary, db_document.id)
            logger.info(f"Report generation process for '{investment_name}' completed successfully.")

        except Exception as e:
            logger.error(f"Error during report generation for investment '{investment_name or investment_id}': {str(e)}")
            await self.db.rollback()
            error_message_content = ERROR_MESSAGE_TEMPLATE.format(investment_name) if investment_name else GENERIC_ERROR_MESSAGE_TEMPLATE.format(investment_id)
            error_message = MessageCreate(role=ASSISTANT_ROLE, content=error_message_content)
            await crud_llm_services.create_message(db=self.db, message=error_message, conversation_id=conversation_id)
            return

    async def _get_comprehensive_investment_data(self, investment_id: int) -> Dict[str, Any]:
        """Fetches all related data for a single investment, including its specific type details."""
        investment = await crud_investments.get_investment(db=self.db, investment_id=investment_id)

        if not investment:
            return {}

        type_specific_data = None
        investment_type = investment.type.upper()

        if investment_type == 'PROJECT':
            type_specific_data = investment.project
        elif investment_type == 'IDEA':
            type_specific_data = investment.idea
        elif investment_type == 'KPI':
            type_specific_data = investment.kpi

        return {
            "investment": investment,
            "risks_issues": investment.risks_issues,
            "documents": investment.documents,
            "tasks": investment.tasks,
            "details": type_specific_data
        }

    def _format_data_for_prompt(self, context: Dict[str, Any]) -> str:
        """
        Assembles all fetched data and injects it into the report template.
        """
        investment = context.get("investment")
        if not investment:
            return ""

        # Main investment details
        inv_details_str = json.dumps(model_to_dict(investment), indent=2)

        # Type-specific details
        type_specific_details_str = "No specific details available for this investment type."
        type_details = context.get("details")
        if type_details:
            type_specific_details_str = json.dumps(model_to_dict(type_details), indent=2)

        # Risks and Issues
        risks_str = "No risks or issues listed."
        risk_details = context.get("risks_issues", [])
        if risk_details:
            risks_str = "\n".join([f"- {risk.name} (Type: {risk.type}, Priority: {risk.priority}, Impact: {risk.impact})" for risk in risk_details])
        
        # Document Contents
        docs_str = "No document contents were provided in this report."
        doc_details = context.get("documents", [])
        if doc_details:
            doc_contents = []
            for doc in doc_details:
                if doc.name.startswith(REPORT_DISPLAY_NAME_PREFIX):
                    logger.info(f"Skipping previously generated AI report: '{doc.name}'")
                    continue

                full_doc_path = PROJECT_ROOT / BACKEND_DIR_NAME / Path(doc.location)

                if not full_doc_path.is_file():
                    logger.warning(f"Document file not found or is not a file: {full_doc_path}")
                    continue

                if full_doc_path.suffix.lower() in READABLE_EXTENSIONS:
                    try:
                        content = full_doc_path.read_text(encoding='utf-8', errors='ignore')
                        doc_contents.append(f"\n**Content from '{doc.name}':**\n{content[:DOC_CONTENT_PREVIEW_LENGTH]}...\n")
                        logger.info(f"Successfully read and added content from '{doc.name}' to the report prompt.")
                    except Exception as e:
                        logger.warning(f"Could not read content from document '{doc.name}' at path {full_doc_path}: {e}")
            
            if doc_contents:
                docs_str = "".join(doc_contents)

        return self.report_template.format(
            investment_type=investment.type,
            investment_name=investment.name,
            investment_details=inv_details_str,
            type_specific_details=type_specific_details_str, 
            risks_and_issues=risks_str,
            document_contents=docs_str
        )

    def _save_report_as_pdf(self, content: str, investment_id: int, unique_filename: str) -> Path:
        """Saves report to the configured reports directory with a unique name."""
        reports_dir = Path(settings.DATA_REPORTS_DIR) / str(investment_id)
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = reports_dir / unique_filename
        
        logger.info(f"Attempting to save PDF to path: {file_path}")
        
        convert_markdown_to_pdf(content, file_path)
        
        return file_path


    async def _summarize_report(self, full_content: str) -> str:
        prompt = self.summarize_template.format(full_report_content=full_content)
        return await self.engine.generate_response([{"role": USER_ROLE, "content": prompt}])

    async def _inject_summary_into_chat(self, conversation_id: int, summary: str, document_id):
        """Creates the final assistant message with the summary and a permanent link."""
        report_link = REPORT_LINK_TEMPLATE.format(document_id=document_id)
        message_content = {
            "type": SUMMARY_MESSAGE_TYPE,
            "summary": summary,
            "report_link": report_link
        }
        print(summary)
        assistant_message = MessageCreate(
            role=ASSISTANT_ROLE,
            content=json.dumps(message_content)
        )
        await crud_llm_services.create_message(
            db=self.db, message=assistant_message, conversation_id=conversation_id
        )

