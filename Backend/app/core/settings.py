"""
Production-safe settings management for the Enterprise Project Management System.
Loads secrets from environment variables and optional YAML configuration.
"""
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import yaml
from pydantic_settings import BaseSettings

# Root directories
BASE_DIR = Path(__file__).resolve().parents[2]
APP_DIR = BASE_DIR / "app"
SECRET_DIR = BASE_DIR / "Secret"
CONFIG_DIR = BASE_DIR / "config"

# Config and env file paths
CONFIG_PATH = CONFIG_DIR / "config.yaml"
ENV_PATH = SECRET_DIR / ".env"

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("epms_settings")


class Settings(BaseSettings):
    """Application settings loaded from environment and YAML."""
    
    # Secrets from environment
    DB_USER: str
    DB_PASS: str
    DB_HOST: str 
    DB_PORT: str 
    DB_NAME: str
    HF_TOKEN: Optional[str] = None
    SECRET_KEY: str
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REMEMBER_ME_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5000,https://localhost:5173"
    GEMINI_API_KEY: Optional[str] = None
    
    # Application behavior
    DEBUG: bool = False
    
    # Internal
    _yaml_config: Optional[Dict[str, Any]] = None
    DATABASE_URL: Optional[str] = None

    class Config:
        """
        Pydantic settings configuration.
        Always loads env_file, but environment variables have priority via model validation.
        """
        env_file = ENV_PATH
        case_sensitive = True
        extra = "ignore"

    def __init__(self, **kwargs):
        # Ensure system environment variables override .env file values
        # This is critical for Docker containers where DB_HOST=db is set via docker-compose
        import os
        
        # Priority: system environment > kwargs > .env file
        # For Docker overrides, check if key env vars are set before using .env
        for key in ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"]:
            if key in os.environ and key not in kwargs:
                kwargs[key] = os.environ[key]
        
        super().__init__(**kwargs)
        self._validate_secrets()
        self._build_database_url()
        self._load_yaml_config()

    def _validate_secrets(self):
        required_vars = ["DB_USER", "DB_PASS", "DB_NAME", "SECRET_KEY"]
        missing = [var for var in required_vars if not getattr(self, var)]
        if missing:
            logger.error(f"Missing required environment variables: {missing}")
            raise EnvironmentError(f"Missing required environment variables: {missing}")

    def _build_database_url(self):
        url = f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        # Ensure SSL parameter compatibility
        if "sslmode=" in url:
            url = url.replace("sslmode=", "ssl=")
        self.DATABASE_URL = url

    def _load_yaml_config(self):
        """Load optional YAML config, fallback to defaults."""
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r") as f:
                self._yaml_config = yaml.safe_load(f)
            prompts = self._yaml_config.get("prompts", {})
            loaded_prompts = {}
            for key, value in prompts.items():
                if isinstance(value, str) and value.endswith(".md") and Path(value).exists():
                    with open(value, "r", encoding="utf-8") as pf:
                        loaded_prompts[key] = pf.read()
                else:
                    loaded_prompts[key] = value
                    
            self._yaml_config["prompts"] = loaded_prompts
            
        else:
            self._yaml_config = {
                "logging": {"log_dir": "./logs/", "log_level": "INFO"},
                "data": {
                    "warehouse_dir": "./data/warehouse",
                    "documents_dir": "./data/warehouse/documents",
                    "reports_dir": "./data/reports",
                },
                "prompts": {
                    "rules": '''
                        You are an AI assistant for an enterprise project management system. 
                        You help users with project planning, risk analysis, workflow management, 
                        and general project-related questions. Provide helpful, professional, 
                        and actionable responses.
                    ''',
                    "report_template": '''
                        Generate a concise project status report with the following sections:
                        - Project Name
                        - Current Status 
                        - Key Milestones Achieved
                        - Risks and Issues
                        - Next Steps
                    ''',
                    "workflow_criteria": '''
                        Evaluate if a project can move to the next workflow stage based on:
                        - All mandatory fields completed
                        - Risk assessment documented
                        - Stakeholder approvals obtained
                        Respond with either "Aprove" or "Cancell" and explain why.
                    '''
                },
                "ai": {"max_tokens": 1024, "temperature": 0.6, "message_summary_threshold": 10},
                "model": {"name": "mistral", "gpu": True, "host": "http://localhost:11434", "response_time_out":60},
            }

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def LOG_DIR(self) -> str:
        return self._yaml_config.get("logging", {}).get("log_dir", "./logs/")

    @property
    def LOG_LEVEL(self) -> str:
        return self._yaml_config.get("logging", {}).get("log_level", "INFO")

    @property
    def DATA_WAREHOUSE_DIR(self) -> str:
        return self._yaml_config.get("data", {}).get("warehouse_dir", "./data/warehouse")

    @property
    def DATA_DOCUMENTS_DIR(self) -> str:
        return self._yaml_config.get("data", {}).get("documents_dir", "./data/warehouse/documents")

    @property
    def DATA_REPORTS_DIR(self) -> str:
        return self._yaml_config.get("data", {}).get("reports_dir", "./data/reports")
   
    @property
    def PROMPTS_CONFIG(self) -> Dict[str, Any]:
        return self._yaml_config.get("prompts", {})
    @property
    def AI_CONFIG(self) -> Dict[str, Any]:
        return self._yaml_config.get("ai", {})

    @property
    def MODEL_CONFIG(self) -> Dict[str, Any]:
        return self._yaml_config.get("model", {})

    def get_yaml_config(self) -> Dict[str, Any]:
        return self._yaml_config or {}


# Global settings instance
settings = Settings()
