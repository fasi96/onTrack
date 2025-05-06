import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, func, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path to import models
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from models import Base, Facility, Layer
except ImportError as e:
    print(f"Error importing models: {e}")
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

def query_data():
    """Query data from the database and display statistics"""
    # Connect to the database
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Get all layers
    layers = session.query(Layer).all()
    print(f"Found {len(layers)} layer(s):\n")
    
    for layer in layers:
        # Count facilities in this layer
        facility_count = session.query(func.count(Facility.id)).filter(Facility.layer_id == layer.id).scalar()
        
        print(f"Layer: {layer.name} (ID: {layer.id})")
        print("Column names:")
        for col in layer.column_names:
            print(f"  - {col}")
        print(f"Facility count: {facility_count}")
        
        # Sample some facilities
        facilities = session.query(Facility).filter(Facility.layer_id == layer.id).limit(5).all()
        
        if facilities:
            print("\nSample facilities:")
            for facility in facilities:
                # Extract some common properties
                uid = facility.data.get('uid', 'N/A')
                city = facility.data.get('city', 'N/A')
                state = facility.data.get('state', 'N/A')
                owner = facility.data.get('owner_name', 'N/A')
                
                print(f"  - ID: {facility.id}, UID: {uid}, Location: {city}, {state}, Owner: {owner}")
        
        print("\n" + "-" * 80 + "\n")
    
    # Close the session
    session.close()

if __name__ == "__main__":
    query_data() 