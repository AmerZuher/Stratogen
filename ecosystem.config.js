module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./Backend",
      script: "./Backend/.venv/bin/python",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload",
      watch: false
    },
    {
      name: "frontend",
      cwd: "./Frontend",
      script: "npm",
      args: "run dev",
      watch: false
    }
  ]
};
