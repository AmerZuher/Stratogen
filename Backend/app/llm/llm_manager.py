"""
LLM Manager for coordinating AI operations by delegating to specialized services.
"""
import logging
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore

from .llm_engine import LLMEngine
from .services.analyst import Analyst
from .services.chat_service import ChatService
from .services.report_service import ReportService

logger = logging.getLogger(__name__)


class LLMManager:
    """
    High-level manager for LLM operations. It delegates to specialized services.
    """

    def __init__(self, db: AsyncSession):
        """Initializes the manager and all its specialized services."""
        self.engine = LLMEngine()
        self.db = db
        self.chat_service = ChatService(engine=self.engine)
        self.analyst = Analyst(engine=self.engine)
        self.report_service = ReportService(engine=self.engine, db=self.db)
        logger.info("LLMManager initialized with Chat, Analyst, and Report services.")

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        conversation_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Delegates chat conversations to the ChatService."""
        return await self.chat_service.generate_response(
            messages=messages,
            conversation_id=conversation_id,
            context=context
        )

    async def trigger_report_generation(
        self,
        investment_id: int,
        investment_name: str,
        investment_type: str,
        conversation_id: int
    ):
        """
        Triggers the full report generation and summarization process.
        """
        logger.info(f"Triggering report generation for investment '{investment_name}' ({investment_id}).")
        await self.report_service.generate_report_and_summary(
            investment_id=investment_id,
            investment_name=investment_name,
            investment_type=investment_type,
            conversation_id=conversation_id
        )

    async def analyze_risk(self, analysis_type: str, data: Dict[str, Any]) -> str:
        """Delegates risk analysis to the Analyst service."""
        logger.info(f"Delegating analysis of type '{analysis_type}'.")
        return await self.analyst.analyze(analysis_type=analysis_type, data=data)


    # --- Utility and Health Check Methods ---
    async def health_check(self) -> Dict[str, Any]:
        """
        Performs a high-level health check on the LLM system by making a
        simple test call through the engine.
        """
        try:
            test_messages = [{"role": "user", "content": "Health check"}]
            # Directly use the engine for a simple, low-level check
            response = await self.engine.generate_response(test_messages)
            
            if response and "Error:" not in response:
                return {"status": "healthy", "detail": "LLM engine is responsive."}
            else:
                raise ConnectionError("Received an empty or error response from the engine.")
        
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {"status": "unhealthy", "detail": str(e)}
