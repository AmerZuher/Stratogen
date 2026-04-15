"""
Service dedicated to handling standard chat conversations.
"""
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from app.core.settings import settings

from ..llm_engine import LLMEngine

logger = logging.getLogger(__name__)

@dataclass
class ChatServiceConfig:
    ERROR_MESSAGE_GENERIC: str = "I apologize, but I encountered an error while processing your chat request."
    EMPTY_RESPONSE_MESSAGE: str = "I'm sorry, I couldn't generate a response. Could you please rephrase your question?"
    CONTEXT_USER_ROLE_TEMPLATE: str = "The user you are speaking to has the role of: {user_role}."
    CONTEXT_PROJECT_TEMPLATE: str = "You are currently discussing the project: {current_project}."
    MAX_CACHE_SIZE: int = 100


class ChatService:

    def __init__(self, engine: LLMEngine, config: ChatServiceConfig = ChatServiceConfig()):

        self.engine = engine
        self.config = config
        self.conversation_cache: Dict[int, List[Dict[str, str]]] = {}
        self.message_summary_threshold = settings.AI_CONFIG.get("message_summary_threshold", ChatServiceConfig.MAX_CACHE_SIZE)
        self.rules =settings.PROMPTS_CONFIG.get("rules", "You are a helpful and professional AI assistant for project management. Be concise, clear, and friendly.")


    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        conversation_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> str:
        """
        Generates a chat response using a structured, multi-step process.
        """
        try:
            # Prepare the messages with a system prompt and context
            enhanced_messages = self._prepare_messages(messages, context)
            
            # Call the low-level engine to get the raw response
            response = await self.engine.generate_response(enhanced_messages, **kwargs)
            
            # Post-process the response for cleanup
            processed_response = self._post_process_response(response)
            
            # Update conversation history cache if an ID is provided
            if conversation_id:
                self._update_conversation_cache(conversation_id, enhanced_messages, processed_response)
            
            return processed_response
            
        except Exception as e:
            logger.error(f"Error in ChatService's generate_response: {str(e)}")
            # Use the configurable error message
            return self.config.ERROR_MESSAGE_GENERIC

    def _prepare_messages(
        self,
        messages: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, str]]:
       
        # Make a copy to avoid modifying the original list
        enhanced_messages = list(messages)
        
        # Check if a system message is already the first message
        if not enhanced_messages or enhanced_messages[0].get("role") != "system":
            system_prompt_content = self._build_system_context(context)
            enhanced_messages.insert(0, {"role": "system", "content": system_prompt_content})
        
        return enhanced_messages

    def _build_system_context(self, context: Optional[Dict[str, Any]] = None) -> str:
        # Use the base prompt from the config
        base_context = self.rules
        
        additional_context = []
        if context:
            if "user_role" in context:
                # Use the template from the config
                additional_context.append(
                    self.config.CONTEXT_USER_ROLE_TEMPLATE.format(user_role=context['user_role'])
                )
            if "current_project" in context:
                # Use the template from the config
                additional_context.append(
                    self.config.CONTEXT_PROJECT_TEMPLATE.format(current_project=context['current_project'])
                )
        
        if additional_context:
            base_context += "\n\n" + "\n".join(additional_context)
            
        return base_context

    def _post_process_response(self, response: str) -> str:
        """Cleans up the raw response from the LLM."""
        processed = response.strip()
        if not processed:
            # Use the configurable empty response message
            return self.config.EMPTY_RESPONSE_MESSAGE
        return processed

    def _update_conversation_cache(self, conversation_id: int, messages: List[Dict[str, str]], response: str):
        """Updates a simple in-memory cache for conversation history."""
        # Note: In a production environment, this should use Redis or a database.
        self.conversation_cache[conversation_id] = messages + [{"role": "assistant", "content": response}]
        
        # Use the max cache size from the config
        if len(self.conversation_cache) > self.message_summary_threshold:
            # Remove the oldest conversation by insertion order
            oldest_key = next(iter(self.conversation_cache))
            del self.conversation_cache[oldest_key]
