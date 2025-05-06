from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

Base = declarative_base()

class Layer(Base):
    __tablename__ = 'layers'
    id = Column(String, primary_key=True)
    name = Column(Text, nullable=False)
    column_names = Column(ARRAY(Text))
    
    # Relationship
    facilities = relationship("Facility", back_populates="layer")
    
    def __repr__(self):
        return f"<Layer(id='{self.id}', name='{self.name}')>"

class Facility(Base):
    __tablename__ = 'facilities'
    id = Column(Integer, primary_key=True)
    geometry = Column(Geometry(geometry_type='Geometry', srid=4326))
    data = Column(JSONB)
    layer_id = Column(String, ForeignKey("layers.id"))
    
    # Relationship
    layer = relationship("Layer", back_populates="facilities")
    
    def __repr__(self):
        if self.data and 'uid' in self.data:
            return f"<Facility(id={self.id}, uid='{self.data['uid']}')>"
        return f"<Facility(id={self.id})>" 