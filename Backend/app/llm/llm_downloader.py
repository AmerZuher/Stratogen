"""
LLM Model Downloader for managing local model installations
"""
import os
import httpx
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class LLMDownloader:
    """
    Handles downloading and managing LLM models for local execution
    """
    
    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.chunk_size = 8192  # 8KB chunks for download
        
        # Model registry with download URLs and metadata
        self.model_registry = {
            "mistral-7b": {
                "name": "Mistral 7B",
                "size_gb": 4.1,
                "url": "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1/resolve/main/pytorch_model.bin",
                "type": "instruct",
                "description": "Mistral 7B Instruct model for general conversation"
            },
            "codellama-7b": {
                "name": "CodeLlama 7B",
                "size_gb": 3.8,
                "url": "https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf/resolve/main/pytorch_model.bin",
                "type": "code",
                "description": "Code Llama 7B for code generation and assistance"
            },
            "llama2-7b-chat": {
                "name": "Llama 2 7B Chat",
                "size_gb": 3.5,
                "url": "https://huggingface.co/meta-llama/Llama-2-7b-chat-hf/resolve/main/pytorch_model.bin",
                "type": "chat",
                "description": "Llama 2 7B optimized for chat conversations"
            }
        }
    
    async def list_available_models(self) -> Dict[str, Dict]:
        """Get list of available models for download"""
        return self.model_registry.copy()
    
    async def list_installed_models(self) -> List[str]:
        """Get list of locally installed models"""
        installed = []
        
        for model_id in self.model_registry.keys():
            model_path = self.models_dir / model_id
            if model_path.exists() and self._is_model_complete(model_path):
                installed.append(model_id)
        
        return installed
    
    async def download_model(
        self,
        model_id: str,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> bool:
        """
        Download a model with progress tracking
        
        Args:
            model_id: ID of the model to download
            progress_callback: Optional callback for progress updates (downloaded, total)
        
        Returns:
            True if download successful, False otherwise
        """
        if model_id not in self.model_registry:
            logger.error(f"Unknown model ID: {model_id}")
            return False
        
        model_info = self.model_registry[model_id]
        model_path = self.models_dir / model_id
        model_path.mkdir(parents=True, exist_ok=True)
        
        # Check if already downloaded
        if self._is_model_complete(model_path):
            logger.info(f"Model {model_id} already installed")
            return True
        
        try:
            logger.info(f"Starting download of {model_info['name']}")
            
            # For this implementation, we'll create placeholder files
            # In a real implementation, you would download from the actual URLs
            success = await self._download_model_files(
                model_id, 
                model_info, 
                model_path, 
                progress_callback
            )
            
            if success:
                # Create model metadata file
                self._create_model_metadata(model_path, model_info)
                logger.info(f"Successfully downloaded {model_info['name']}")
                return True
            else:
                logger.error(f"Failed to download {model_info['name']}")
                return False
                
        except Exception as e:
            logger.error(f"Error downloading model {model_id}: {str(e)}")
            return False
    
    async def remove_model(self, model_id: str) -> bool:
        """Remove a locally installed model"""
        if model_id not in self.model_registry:
            logger.error(f"Unknown model ID: {model_id}")
            return False
        
        model_path = self.models_dir / model_id
        
        if not model_path.exists():
            logger.warning(f"Model {model_id} not found locally")
            return True
        
        try:
            # Remove model directory
            import shutil
            shutil.rmtree(model_path)
            logger.info(f"Removed model {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error removing model {model_id}: {str(e)}")
            return False
    
    async def get_model_info(self, model_id: str) -> Optional[Dict]:
        """Get detailed information about a model"""
        if model_id not in self.model_registry:
            return None
        
        model_info = self.model_registry[model_id].copy()
        model_path = self.models_dir / model_id
        
        # Add installation status
        model_info["installed"] = self._is_model_complete(model_path)
        
        if model_info["installed"]:
            # Add local file information
            metadata_file = model_path / "metadata.json"
            if metadata_file.exists():
                try:
                    import json
                    with open(metadata_file, 'r') as f:
                        local_metadata = json.load(f)
                        model_info.update(local_metadata)
                except Exception as e:
                    logger.warning(f"Error reading model metadata: {str(e)}")
        
        return model_info
    
    async def check_disk_space(self, model_id: str) -> Dict[str, Any]:
        """Check if there's enough disk space for a model"""
        if model_id not in self.model_registry:
            return {"sufficient": False, "error": "Unknown model"}
        
        model_info = self.model_registry[model_id]
        required_gb = model_info["size_gb"]
        
        try:
            import shutil
            total, used, free = shutil.disk_usage(self.models_dir)
            free_gb = free / (1024**3)  # Convert to GB
            
            return {
                "sufficient": free_gb >= required_gb,
                "required_gb": required_gb,
                "available_gb": round(free_gb, 2),
                "total_gb": round(total / (1024**3), 2)
            }
            
        except Exception as e:
            logger.error(f"Error checking disk space: {str(e)}")
            return {"sufficient": False, "error": str(e)}
    
    async def _download_model_files(
        self,
        model_id: str,
        model_info: Dict,
        model_path: Path,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> bool:
        """
        Download model files (placeholder implementation)
        
        In a real implementation, this would:
        1. Download the actual model files from HuggingFace or other sources
        2. Verify checksums
        3. Handle resume/retry logic
        4. Support different model formats (GGML, GGUF, PyTorch, etc.)
        """
        try:
            # For this implementation, create placeholder files to simulate download
            model_file = model_path / "model.bin"
            config_file = model_path / "config.json"
            tokenizer_file = model_path / "tokenizer.json"
            
            # Simulate download progress
            total_size = int(model_info["size_gb"] * 1024 * 1024 * 1024)  # Convert to bytes
            downloaded = 0
            
            # Create placeholder files with some content
            with open(model_file, 'wb') as f:
                chunk_size = 1024 * 1024  # 1MB chunks
                while downloaded < total_size:
                    chunk = b'0' * min(chunk_size, total_size - downloaded)
                    f.write(chunk)
                    downloaded += len(chunk)
                    
                    if progress_callback:
                        progress_callback(downloaded, total_size)
                    
                    # Small delay to simulate download time
                    await asyncio.sleep(0.01)
            
            # Create config files
            config = {
                "model_type": model_info["type"],
                "name": model_info["name"],
                "downloaded_at": str(asyncio.get_event_loop().time())
            }
            
            import json
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2)
            
            with open(tokenizer_file, 'w') as f:
                json.dump({"vocab_size": 32000}, f)
            
            return True
            
        except Exception as e:
            logger.error(f"Error in download simulation: {str(e)}")
            return False
    
    def _is_model_complete(self, model_path: Path) -> bool:
        """Check if a model is completely downloaded"""
        required_files = ["model.bin", "config.json"]
        
        for filename in required_files:
            file_path = model_path / filename
            if not file_path.exists() or file_path.stat().st_size == 0:
                return False
        
        return True
    
    def _create_model_metadata(self, model_path: Path, model_info: Dict) -> None:
        """Create metadata file for downloaded model"""
        try:
            import json
            from datetime import datetime
            
            metadata = {
                **model_info,
                "download_date": datetime.utcnow().isoformat(),
                "downloader_version": "1.0.0",
                "path": str(model_path)
            }
            
            metadata_file = model_path / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
                
        except Exception as e:
            logger.warning(f"Error creating model metadata: {str(e)}")
    
    async def get_download_progress(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Get download progress for a model (placeholder for real implementation)"""
        # In a real implementation, this would track ongoing downloads
        return None
    
    async def verify_model_integrity(self, model_id: str) -> Dict[str, Any]:
        """Verify the integrity of a downloaded model"""
        if model_id not in self.model_registry:
            return {"valid": False, "error": "Unknown model"}
        
        model_path = self.models_dir / model_id
        
        if not model_path.exists():
            return {"valid": False, "error": "Model not found"}
        
        try:
            # Basic checks
            checks = {
                "files_exist": self._is_model_complete(model_path),
                "metadata_valid": (model_path / "metadata.json").exists(),
                "model_size_ok": True  # Would check actual file sizes
            }
            
            all_valid = all(checks.values())
            
            return {
                "valid": all_valid,
                "checks": checks,
                "model_id": model_id
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def get_models_directory(self) -> str:
        """Get the models directory path"""
        return str(self.models_dir.absolute())
    
    async def cleanup_partial_downloads(self) -> List[str]:
        """Clean up any partial or corrupted downloads"""
        cleaned = []
        
        try:
            for model_id in self.model_registry.keys():
                model_path = self.models_dir / model_id
                
                if model_path.exists() and not self._is_model_complete(model_path):
                    import shutil
                    shutil.rmtree(model_path)
                    cleaned.append(model_id)
                    logger.info(f"Cleaned up partial download: {model_id}")
            
            return cleaned
            
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            return cleaned
