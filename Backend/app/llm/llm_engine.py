"""
LLM Engine for handling different AI model integrations
"""
import httpx
import logging
from typing import Dict, List, Optional, Any
from abc import ABC, abstractmethod

from app.core.settings import settings

logger = logging.getLogger(__name__)

# --- CONFIGURATION VALUES ---
# Default values for model parameters, sourced from settings if available.
# This centralizes configuration and avoids hardcoded values in the code.
AI_CONFIG = settings.AI_CONFIG
MODEL_CONFIG = settings.MODEL_CONFIG

# Ollama specific settings
DEFAULT_OLLAMA_HOST = MODEL_CONFIG.get("host", "http://ollama:11434")
DEFAULT_MODEL_NAME = MODEL_CONFIG.get("name", "mistral")
DEFAULT_RESPONSE_TIMEOUT = MODEL_CONFIG.get("response_time_out", 300.0)
DEFAULT_AVAILABILITY_TIMEOUT = MODEL_CONFIG.get("availability_check_timeout", 5.0)

# AI generation settings
DEFAULT_TEMPERATURE = AI_CONFIG.get("temperature", 0.7)
DEFAULT_MAX_TOKENS = AI_CONFIG.get("max_tokens", 4096)

# LLM Provider setting
DEFAULT_PROVIDER = MODEL_CONFIG.get("provider", "ollama")


class BaseLLMEngine(ABC):
    """Base class for LLM engines"""

    @abstractmethod
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate a response from the LLM"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the LLM engine is available"""
        pass


class OllamaEngine(BaseLLMEngine):
    """Ollama LLM engine for local model hosting"""

    def __init__(self):
        self.host = DEFAULT_OLLAMA_HOST
        self.model_name = DEFAULT_MODEL_NAME
        self.timeout = DEFAULT_RESPONSE_TIMEOUT
        self.availability_timeout = DEFAULT_AVAILABILITY_TIMEOUT
        self.temperature = DEFAULT_TEMPERATURE
        self.max_tokens = DEFAULT_MAX_TOKENS
        
        logger.info(
            f"OllamaEngine configured for model '{self.model_name}' at {self.host} "
            f"with a response timeout of {self.timeout}s and availability check timeout of {self.availability_timeout}s"
        )

    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:       
        """Generate response using Ollama API"""
        try:
            payload = {
                "model": self.model_name,
                "messages": messages, # Pass the list directly
                "stream": False,
                "options": {
                    "temperature": kwargs.get("temperature", self.temperature),
                    "num_predict": kwargs.get("max_tokens", self.max_tokens),
                }
            }
            # Use the configured timeout for the client session
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Use /api/chat instead of /api/generate
                response = await client.post(f"{self.host}/api/chat", json=payload)
                response.raise_for_status()
            
            response_data = response.json()
            return response_data.get("message", {}).get("content", "").strip()            
    
        except httpx.TimeoutException:
            logger.error(f"Request to Ollama timed out after {self.timeout} seconds.")
            return f"Error: The request to the AI service timed out after {self.timeout} seconds. The task may be too complex."
        except httpx.ConnectError as e:
            logger.error(f"Ollama connection error: {e}")
            return f"Error: Could not connect to Ollama at {self.host}. Please ensure Ollama is running."
        except httpx.HTTPStatusError as e:
            logger.error(f"Ollama API returned an error: {e.response.status_code} - {e.response.text}")
            return f"Error: The LLM service returned a {e.response.status_code} error."
        except Exception as e:
            logger.error(f"An unexpected error occurred in OllamaEngine: {str(e)}")
            return "Error: An unexpected error occurred while communicating with the AI service."

    def is_available(self) -> bool:
        try:
            with httpx.Client(timeout=self.availability_timeout) as client:
                response = client.get(self.host) # This hits http://ollama:11434
                return response.status_code == 200
        except httpx.RequestError:
            return False

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        """
        Formats a list of message dictionaries into a single string prompt
        that is compatible with Ollama's /api/generate endpoint.
        """
        prompt_parts = []
        for msg in messages:
            role = msg.get('role', 'user').capitalize()
            content = msg.get('content', '')
            prompt_parts.append(f"<{role}>:\n{content}\n")
        
        prompt_parts.append("<Assistant>:")
        return "\n".join(prompt_parts)


class MockEngine(BaseLLMEngine):
    """Mock LLM engine for testing and development"""

    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        last_message = messages[-1]['content'] if messages else "no message"
        return f"Mock response to: '{last_message}'"

    def is_available(self) -> bool:
        return True


class LLMEngine:
    """
    Main LLM Engine class that routes to the appropriate engine.
    """

    def __init__(self, engine_type: Optional[str] = None):
        if engine_type is None:
            engine_type = DEFAULT_PROVIDER.lower()

        logger.info(f"Attempting to initialize LLM with engine type: {engine_type}")
        
        if engine_type == "ollama":
            self.engine = OllamaEngine()
        elif engine_type == "mock":
            self.engine = MockEngine()
        else:
            raise ValueError(f"Unsupported LLM engine type: {engine_type}")

        if not self.engine.is_available():
            raise ConnectionError(
                f"The selected LLM engine '{engine_type}' is not available. "
                f"Please ensure the service (e.g., Ollama) is running and accessible."
            )
        
        logger.info(f"Successfully initialized LLM engine: {engine_type}")

    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Main entry point for generating a response. Delegates to the selected engine.
        """
        return await self.engine.generate_response(messages, **kwargs)
