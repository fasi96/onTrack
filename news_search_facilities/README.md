# Facility News Watcher

A Python-based system for monitoring facilities using geographic and metadata information. The system loads facility data, processes it, and enables searching for relevant news.

## Data Ingestion System Overview

This system loads facility data from GeoJSON files into a PostgreSQL database with PostGIS. The system:

1. Iterates over all .json files in the data/ directory
2. For each file:
   - Generates a layer_id from the filename
   - Adds one row in the layers table (if not already exists)
   - Adds each feature in the file to the facilities table (if not already exists for that layer and geometry)
3. Is re-runnable without duplication

## Setup

### Prerequisites

- Python 3.12.10
- PostgreSQL with PostGIS extension
- Virtual environment

### Database Setup

1. Make sure PostgreSQL with PostGIS extension is installed and running
2. Create a database named `facilities` (or use the name specified in your environment variables)
3. Run the database setup script:

```bash
# Activate the virtual environment
.\venv\Scripts\activate

# Run the setup script to create tables and load data
python reset_db.py
```

This creates the following tables:

- `layers`: Stores layer definitions with columns for id, name, and column_names
- `facilities`: Stores geographic features with columns for id, geometry, data, and layer_id

### Environment Variables

The application uses the following environment variables (default values shown):

- `PG_HOST`: localhost
- `PG_PORT`: 5432
- `PG_DB`: facilities
- `PG_USER`: postgres
- `PG_PASSWORD`: admin

You can set these in a `.env` file in the project root or as system environment variables.

### Available Scripts

- `python reset_db.py`: Drops existing tables, creates new ones, and loads all data
- `python load_data.py`: Adds data from GeoJSON files (skips existing data)
- `python verify_data.py`: Checks that data was loaded correctly

### ORM Models

The system uses SQLAlchemy ORM models:

- `Layer`: Represents a layer with id, name, and column_names
- `Facility`: Represents a facility with geometry, data (JSONB), and layer_id

### Adding New Data

To add new data files:

1. Place GeoJSON files in the `data/` directory
2. Run `python load_data.py`

The system will automatically create new layers for new files and add new features, while skipping duplicates.

## Running the Application

(Add application running instructions here)
