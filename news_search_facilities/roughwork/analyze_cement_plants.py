import pandas as pd
import json
import os

# Define the path to the data file
data_path = r'C:\Users\fasiu\OneDrive\Documents\GitHub\data-layer\Datasets\Raw\Cement Plants\doi_10_5061_dryad_6t1g1jx4f__v20231004\SFI-Global-Cement-Database-assets.csv'

# Create output directory if it doesn't exist
os.makedirs('roughwork/output', exist_ok=True)

# Read the data file
df = pd.read_csv(data_path)

# Filter for US cement plants (as shown in the notebook)
us_plants = df[df.country == 'United States of America']

# Display basic info about the dataset
print(f"Total cement plants: {len(df)}")
print(f"US cement plants: {len(us_plants)}")
print("\nColumns in the dataset:")
for col in df.columns:
    print(f"- {col}")

# Count non-null values in each column for US plants
print("\nNon-null values count for US plants:")
non_null_counts = us_plants.count()
for col, count in non_null_counts.items():
    percentage = (count / len(us_plants)) * 100
    print(f"- {col}: {count} ({percentage:.1f}%)")

# Sample data for a few plants
print("\nSample data (first 5 US plants):")
print(us_plants.head().to_string())

# Based on the analysis, let's identify columns useful for news search
# We want columns that help identify plants, owners, and locations
print("\nRecommended columns for news search:")
news_search_columns = [
    'uid',          # Unique identifier
    'city',         # Location
    'state',        # Location
    'country',      # Location
    'latitude',     # Precise location
    'longitude',    # Precise location
    'status',       # Plant status (operating, closed, etc.)
    'plant_type',   # Type of plant
    'capacity',     # Production capacity
    'owner_name',   # Current owner 
    'parent_name',  # Parent company
    'raw_mtrl'      # Raw materials used (can help with environmental news)
]

for col in news_search_columns:
    if col in us_plants.columns:
        print(f"- {col}")

# Create a filtered dataset with useful columns
filtered_df = us_plants[news_search_columns].copy()

# Handle any missing values for JSON export
filtered_df = filtered_df.fillna("")

# Save as CSV for review
filtered_df.to_csv('roughwork/output/filtered_cement_plants.csv', index=False)

# Print first few rows of filtered data
print("\nFiltered data (first 5 rows):")
print(filtered_df.head().to_string())

# Create full JSON structure for all plants
all_plants_json = []
for idx, row in filtered_df.iterrows():
    plant_dict = row.to_dict()
    
    # Clean empty strings from JSON
    cleaned_dict = {k: v for k, v in plant_dict.items() if v != ""}
    
    # Add search keywords field to help with news search
    keywords = []
    if plant_dict['city']: keywords.append(plant_dict['city'])
    if plant_dict['state']: keywords.append(plant_dict['state'])
    if plant_dict['owner_name']: keywords.append(plant_dict['owner_name'])
    if plant_dict['parent_name']: keywords.append(plant_dict['parent_name'])
    
    # Add cement and plant keywords
    keywords.extend(['cement', 'cement plant', 'concrete'])
    
    # Add the keywords to the plant dictionary
    cleaned_dict['search_keywords'] = keywords
    
    # Create a search string that could be used for news queries
    search_string = f"{plant_dict['city']} {plant_dict['state']} cement plant {plant_dict['owner_name']}".strip()
    cleaned_dict['search_string'] = search_string
    
    all_plants_json.append(cleaned_dict)

# Save full JSON
with open('roughwork/output/cement_plants_for_news_search.json', 'w') as f:
    json.dump(all_plants_json, f, indent=2)

# Save sample with first 10 plants
with open('roughwork/output/sample_cement_plants.json', 'w') as f:
    json.dump(all_plants_json[:10], f, indent=2)

# Print sample of JSON structure
print("\nSample JSON structure:")
print(json.dumps(all_plants_json[0], indent=2))

print("\nAnalysis complete. Files saved to roughwork/output directory:")
print("- filtered_cement_plants.csv: All US plants with relevant columns")
print("- cement_plants_for_news_search.json: Complete JSON with all plants")
print("- sample_cement_plants.json: Sample JSON with first 10 plants") 