import pypandoc
import logging
from pathlib import Path
from typing import Optional


logger = logging.getLogger(__name__)

def convert_markdown_to_pdf(
    markdown_text: str,
    output_path: Path,
    template_path: Optional[str] = None
):

    logger.info(f"Starting PDF conversion for: {output_path}")
    extra_args = [
        "--standalone",
        "--pdf-engine=xelatex",
    ]

    if template_path:
        logger.info(f"Using template: {template_path}")
        extra_args.extend(["--template", template_path])

    try:
        pypandoc.convert_text(
            source=markdown_text,
            to="pdf",
            format="md",
            outputfile=str(output_path),
            extra_args=extra_args,
        )
        logger.info(f"✅ Successfully created PDF: {output_path}")

    except RuntimeError as e:
        logger.error(f"❌ Pandoc conversion failed for {output_path}.")
        logger.error(f"    Pandoc error: {e}")
        raise

