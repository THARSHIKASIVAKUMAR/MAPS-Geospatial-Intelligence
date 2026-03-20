import json
import random

def generate_points(n=30000):
    features = []
    
    # Professional Naming Components
    prefixes = [
        "Elite", "Prime", "Global", "Apex", "Zenith", "Quantum", "Nexus", "Titan", "Velocity", "Summit",
        "Legacy", "Vision", "Core", "Insight", "Dynamic", "Pioneer", "Strategic", "Capital", "Omega", "Alpha"
    ]
    suffixes = [
        "Enterprises", "Solutions", "Systems", "Group", "Consultancy", "Industries", "Logistics", "Ventures", 
        "Corporation", "Nexus", "Agencies", "Dynamics", "Technics", "Partner", "Markets", "Network"
    ]
    statuses = ['active', 'inactive', 'pending']
    managers = ["Aditya V.", "Priya S.", "Rohan M.", "Ananya K.", "Vikram R.", "Meera T."]

    for i in range(n):
        # Coordinates for Chennai metro area
        lon = random.uniform(80.15, 80.30)
        lat = random.uniform(12.85, 13.15)
        
        # Region classification logic
        if lat > 13.05:
            region = 'North Chennai'
        elif lat < 12.95:
            region = 'South Chennai'
        elif lon < 80.20:
            region = 'West Chennai'
        elif lon > 80.25:
            region = 'East Chennai'
        else:
            region = 'Central'
            
        # Create a unique, professional business name
        business_name = f"{random.choice(prefixes)} {random.choice(suffixes)} #{1000 + i}"
            
        feature = {
            "type": "Feature",
            "properties": {
                "id": 1000 + i,
                "name": business_name,
                "region": region,
                "status": random.choice(statuses),
                "performance_score": random.randint(15, 98),
                "sales": random.randint(250000, 7500000),
                "targets_met": random.randint(20, 100),
                "manager": random.choice(managers),
                "phone": f"+91 9{random.randint(10000000, 99999999)}",
                "last_active": f"{random.randint(1, 28)} Oct 2026"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        }
        features.append(feature)
        
    return {"type": "FeatureCollection", "features": features}

def generate_territories():
    features = [
        {
            "type": "Feature",
            "properties": {"name": "North Chennai", "color": "#3b82f6", "manager": "Aditya V.", "target": 12000000},
            "geometry": {"type": "Polygon", "coordinates": [[[80.15, 13.15], [80.30, 13.15], [80.30, 13.05], [80.15, 13.05], [80.15, 13.15]]]}
        },
        {
            "type": "Feature",
            "properties": {"name": "Central", "color": "#10b981", "manager": "Priya S.", "target": 25000000},
            "geometry": {"type": "Polygon", "coordinates": [[[80.20, 13.05], [80.25, 13.05], [80.25, 12.95], [80.20, 12.95], [80.20, 13.05]]]}
        },
        {
            "type": "Feature",
            "properties": {"name": "South Chennai", "color": "#f59e0b", "manager": "Rohan M.", "target": 18500000},
            "geometry": {"type": "Polygon", "coordinates": [[[80.15, 12.95], [80.30, 12.95], [80.30, 12.85], [80.15, 12.85], [80.15, 12.95]]]}
        },
        {
            "type": "Feature",
            "properties": {"name": "West Chennai", "color": "#8b5cf6", "manager": "Ananya K.", "target": 14000000},
            "geometry": {"type": "Polygon", "coordinates": [[[80.15, 13.05], [80.20, 13.05], [80.20, 12.95], [80.15, 12.95], [80.15, 13.05]]]}
        },
        {
            "type": "Feature",
            "properties": {"name": "East Chennai", "color": "#ef4444", "manager": "Vikram R.", "target": 16500000},
            "geometry": {"type": "Polygon", "coordinates": [[[80.25, 13.05], [80.30, 13.05], [80.30, 12.95], [80.25, 12.95], [80.25, 13.05]]]}
        }
    ]
    return {"type": "FeatureCollection", "features": features}

# Output as minified JSON for performance
with open('d:/1-PC/Downloads/MAPS/src/data/salespoints.json', 'w') as f:
    json.dump(generate_points(30000), f, separators=(',', ':'))

with open('d:/1-PC/Downloads/MAPS/src/data/territories.json', 'w') as f:
    json.dump(generate_territories(), f, separators=(',', ':'))
