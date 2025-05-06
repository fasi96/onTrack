import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Database connection parameters
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "facilities")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "admin")

def create_tables():
    """
    Create the necessary tables in the database.
    This includes the layers table and the features table.
    """
    # SQL commands to create tables
    commands = [
        """
        CREATE TABLE IF NOT EXISTS layers (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            column_names TEXT[]
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS features (
            id SERIAL PRIMARY KEY,
            geometry GEOMETRY(Geometry, 4326),
            data JSONB,
            layer_id INTEGER REFERENCES layers(id)
        )
        """
    ]
    
    # Create a new connection
    conn = None
    try:
        # Connect to the PostgreSQL server
        conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            database=PG_DB,
            user=PG_USER,
            password=PG_PASSWORD
        )
        
        # Create a cursor
        cur = conn.cursor()
        
        # Execute each command
        for command in commands:
            cur.execute(command)
            
        # Close the cursor
        cur.close()
        
        # Commit the changes
        conn.commit()
        
        print("Tables created successfully!")
        
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error: {error}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    create_tables() 