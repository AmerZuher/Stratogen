"""
Workflow Assistance Module.

This module helps with various workflow tasks like suggesting improvements,
extracting action items, or summarizing text.
"""
from typing import Dict, Any
from ..llm_engine import LLMEngine

class WorkflowAssistant:
    def __init__(self, llm_engine: LLMEngine):
        self.llm_engine = llm_engine

    async def assist(
        self,
        content: str,
        task: str = "suggest_improvements",
        **kwargs
    ) -> str:
       
        print(f"Assisting with task: '{task}'...")
        system_prompt = self._create_system_prompt(task)
        user_prompt = f"Please perform the following task: {task.replace('_', ' ')}.\n\nHere is the content:\n{content}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        assistance_result = await self.llm_engine.generate_response(messages, **kwargs)
        return assistance_result

    def _create_system_prompt(self, task: str) -> str:
        """Creates a tailored system prompt based on the assistance task."""
        prompts = {
            "suggest_improvements": "You are an efficiency expert and consultant. Analyze the provided content and offer specific, actionable suggestions for improvement. Explain the reasoning behind each suggestion.",
            "extract_action_items": "You are a highly organized project coordinator. Extract all clear, actionable items from the provided text. Format them as a numbered list. If possible, identify assignees and deadlines.",
            "summarize": "You are an expert summarizer. Provide a concise summary of the key points and main ideas from the provided content. The summary should be easy to understand for someone unfamiliar with the topic.",
            "default": "You are a helpful AI assistant. Fulfill the user's request based on the provided text."
        }
        return prompts.get(task, prompts["default"])
