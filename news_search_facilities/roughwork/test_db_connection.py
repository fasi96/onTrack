import os
import sys
import traceback
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path to import models
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from models import Base, Layer
    print("Successfully imported models")
except ImportError as e:
    print(f"Error importing models: {e}")
    traceback.print_exc()
    sys.exit(1)

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
print(f"Database URL: {DB_URL}")

def test_connection():
    """Test the connection to the PostgreSQL database"""
    print(f"Testing connection to: {DB_URL}")
    try:
        # Create engine
        engine = create_engine(DB_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"Successfully connected to PostgreSQL. Version: {version}")
            
            # Check if PostGIS is installed
            try:
                result = conn.execute(text("SELECT PostGIS_Version();"))
                postgis_version = result.fetchone()[0]
                print(f"PostGIS version: {postgis_version}")
            except Exception as e:
                print(f"Error checking PostGIS version: {e}")
                print("PostGIS may not be installed")
            
        return True
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        traceback.print_exc()
        return False

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
        traceback.print_exc()
        return False

def test_create_tables():
    """Test creating tables in the database"""
    try:
        engine = create_engine(DB_URL)
        Base.metadata.create_all(engine)
        print("Tables created successfully!")
        
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check if test layer exists
        test_layer = session.query(Layer).filter_by(id='test_layer').first()
        
        if not test_layer:
            # Create a test layer
            test_layer = Layer(
                id='test_layer',
                name='Test Layer',
                column_names=['name', 'value']
            )
            session.add(test_layer)
            session.commit()
            print("Created test layer")
        else:
            print("Test layer already exists")
        
        session.close()
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting database connection test...")
    if test_connection():
        if drop_tables():
            test_create_tables()
    else:
        print("Could not connect to the database. Please check your connection parameters.") 