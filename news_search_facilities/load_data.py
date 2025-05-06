import os
import json
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, exists
from models import Base, Facility, Layer
from geoalchemy2.shape import from_shape
from shapely.geometry import shape
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "facilities")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "admin")

# --- Config ---
DATA_DIR = "data"
DB_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}"

def load_data():
    """
    Load data from all JSON files in the data directory into the database.
    Creates layers and facilities based on the GeoJSON content.
    """
    print("Starting data loading process...")
    
    # Connect to the database
    engine = create_engine(DB_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Ensure tables exist
    Base.metadata.create_all(engine)
    
    # Process all JSON files in the data directory
    for fname in os.listdir(DATA_DIR):
        if not fname.endswith(".json"):
            continue
        
        layer_id = os.path.splitext(fname)[0]
        filepath = os.path.join(DATA_DIR, fname)
        
        print(f"Processing file: {fname}")
        
        # Load the GeoJSON file
        with open(filepath) as f:
            geojson = json.load(f)
            
        if 'features' not in geojson or not geojson['features']:
            print(f"Warning: No features found in {fname}, skipping")
            continue
            
        # Check if layer already exists
        existing_layer = session.query(Layer).filter_by(id=layer_id).first()
        
        if not existing_layer:
            print(f"Creating new layer: {layer_id}")
            
            # Extract column names from first feature
            first_props = geojson["features"][0]["properties"]
            layer = Layer(
                id=layer_id,
                name=layer_id.replace("_", " ").title(),
                column_names=list(first_props.keys())
            )
            session.add(layer)
            session.commit()
            print(f"Layer created: {layer_id}")
        else:
            print(f"Layer {layer_id} already exists")
            
        # Add features
        features_added = 0
        features_skipped = 0
        
        for feature in geojson["features"]:
            geom = from_shape(shape(feature["geometry"]), srid=4326)
            props = feature["properties"]
            
            # Check if feature already exists (same geometry and layer)
            exists_query = session.query(Facility).filter(
                Facility.layer_id == layer_id,
                Facility.geometry.ST_Equals(geom)
            ).first()
            
            if not exists_query:
                facility = Facility(
                    geometry=geom,
                    data=props,
                    layer_id=layer_id
                )
                session.add(facility)
                features_added += 1
            else:
                features_skipped += 1
                
        session.commit()
        print(f"Layer {layer_id}: Added {features_added} new features, skipped {features_skipped} existing features")
    
    session.close()
    print("✅ Data loading complete.")

if __name__ == "__main__":
    load_data() 