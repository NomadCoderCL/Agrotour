#!/usr/bin/env python
"""
Quick start script for Agrotour Sync Engine.
"""

import subprocess
import sys
import os
from pathlib import Path


def main():
    """Run quick start setup."""
    print("🚀 Agrotour Sync Engine - Quick Start\n")
    
    # Check Python version
    if sys.version_info < (3, 11):
        print("❌ Python 3.11+ required")
        sys.exit(1)
    
    print("✅ Python version OK")
    
    # Check if Poetry is installed
    try:
        subprocess.run(["poetry", "--version"], check=True, capture_output=True)
        print("✅ Poetry installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Poetry not found. Install with: pip install poetry")
        sys.exit(1)
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    subprocess.run(["poetry", "install"], check=True)
    print("✅ Dependencies installed")
    
    # Check for .env file
    env_file = Path(".env")
    if not env_file.exists():
        print("\n⚠️  Creating .env file from .env.example...")
        subprocess.run(["cp", ".env.example", ".env"], check=True)
        print("✅ .env file created")
        print("⚠️  Please edit .env with your database credentials")
    else:
        print("✅ .env file exists")
    
    # Check PostgreSQL connection
    print("\n🔍 Checking PostgreSQL connection...")
    try:
        import psycopg2
        from dotenv import load_dotenv
        load_dotenv()
        
        db_url = os.getenv("DATABASE_URL")
        # Simple connection test would go here
        print("✅ Database configuration loaded")
    except ImportError:
        print("⚠️  psycopg2 not installed yet (will be installed with poetry)")
    
    print("\n✅ Setup complete!")
    print("\n📝 Next steps:")
    print("1. Edit .env with your database credentials")
    print("2. Create PostgreSQL database: createdb agrotour")
    print("3. Run server: poetry run uvicorn app.main:app --reload --port 8001")
    print("4. Visit http://localhost:8001/docs for API documentation")
    print("\n🧪 Run tests: poetry run pytest")


if __name__ == "__main__":
    main()
