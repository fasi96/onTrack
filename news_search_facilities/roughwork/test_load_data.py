import os
import sys
import json
import traceback
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from geoalchemy2.shape import from_shape
from shapely.geometry import shape

# Add the parent directory to the path to import models
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from models import Base, Facility, Layer
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

def test_load_data():
    """
    Test loading a single GeoJSON file into the database.
    """
    # Path to the sample data file
    filepath = os.path.join(parent_dir, "data", "cement_plants.json")
    layer_id = "cement_plants"
    
    print(f"Testing loading data from {filepath}...")
    
    try:
        # Connect to the database
        engine = create_engine(DB_URL)
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check if the layer already exists
        existing_layer = session.query(Layer).filter_by(id=layer_id).first()
        
        if existing_layer:
            print(f"Layer {layer_id} already exists with column names: {existing_layer.column_names}")
            
            # Count existing facilities
            facility_count = session.query(Facility).filter_by(layer_id=layer_id).count()
            print(f"Found {facility_count} existing facilities in layer {layer_id}")
        else:
            print(f"Layer {layer_id} does not exist yet")
            
            # Load the GeoJSON file
            with open(filepath) as f:
                geojson = json.load(f)
            
            print(f"Loaded GeoJSON with {len(geojson['features'])} features")
            
            # Extract column names from first feature
            if len(geojson["features"]) > 0:
                first_props = geojson["features"][0]["properties"]
                
                # Create the layer
                layer = Layer(
                    id=layer_id,
                    name=layer_id.replace("_", " ").title(),
                    column_names=list(first_props.keys())
                )
                session.add(layer)
                session.commit()
                print(f"Created layer {layer_id} with column names: {layer.column_names}")
                
                # Add a sample facility (just the first one for testing)
                feature = geojson["features"][0]
                geom = from_shape(shape(feature["geometry"]), srid=4326)
                props = feature["properties"]
                
                facility = Facility(
                    geometry=geom,
                    data=props,
                    layer_id=layer_id
                )
                session.add(facility)
                session.commit()
                print(f"Added facility: {props.get('uid', 'unknown')} - {props.get('city', 'unknown')}, {props.get('state', 'unknown')}")
                
        session.close()
        return True
    except Exception as e:
        print(f"Error loading data: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_load_data() 