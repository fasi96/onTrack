import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from models import Base, Layer, Facility
from load_data import load_data

# Load environment variables
load_dotenv()

# Database connection parameters
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "facilities")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "admin")

# Database URL
DB_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}"

def drop_tables():
    """Drop existing tables"""
    print("Dropping existing tables...")
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS facilities CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS layers CASCADE;"))
            conn.commit()
        print("Tables dropped successfully")
        return True
    except Exception as e:
        print(f"Error dropping tables: {e}")
        return False

def create_tables():
    """Create the database tables"""
    print("Creating tables...")
    try:
        engine = create_engine(DB_URL)
        Base.metadata.create_all(engine)
        print("Tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

def reset_and_load():
    """Drop tables, recreate them, and load data"""
    print("Starting database reset process...")
    
    # Drop existing tables
    if not drop_tables():
        print("Failed to drop tables. Exiting.")
        return False
    
    # Create tables
    if not create_tables():
        print("Failed to create tables. Exiting.")
        return False
    
    # Load data
    print("Loading data...")
    load_data()
    
    print("✅ Reset process completed successfully.")
    return True

if __name__ == "__main__":
    reset_and_load() 