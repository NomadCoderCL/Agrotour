import os
import sys
from django.core.management import call_command

def load_data():
    """
    Utility script to load exported data into PostgreSQL.
    Usage: python load_data.py
    """
    print("--- Agrotour Data Restoration Utility ---")
    
    # 1. Setup Environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings.production')
    try:
        import django
        django.setup()
    except Exception as e:
        print(f"Error setting up Django: {e}")
        return

    print("Target Environment: PRODUCTION (PostgreSQL)")
    confirm = input("Are you sure you want to load 'data.json' into the configured PRODUCTION database? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Aborted.")
        return

    # 2. Migration
    print("\nStep 1: Applying migrations to ensure schema is ready...")
    try:
        call_command('migrate')
    except Exception as e:
        print(f"Migration failed: {e}")
        return

    # 3. Load Data
    print("\nStep 2: Loading data from 'data.json'...")
    try:
        # Using loaddata directly
        call_command('loaddata', 'data.json')
        print("\nSUCCESS: Data loaded successfully! 🌱")
    except Exception as e:
        print(f"\nERROR: Failed to load data: {e}")
        print("Tip: If you have integrity errors, you might need to flush the database first using 'python manage.py flush'.")

if __name__ == "__main__":
    load_data()
