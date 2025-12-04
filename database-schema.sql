-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buildings table
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spots table
CREATE TABLE spots (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  floor INTEGER NOT NULL,
  building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
  is_occupied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  card_id VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('car_owner', 'building_owner')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User_spots table (parking sessions)
CREATE TABLE user_spots (
  id SERIAL PRIMARY KEY,
  spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
  unique_code VARCHAR(10) UNIQUE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  parked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_spots_building_id ON spots(building_id);
CREATE INDEX idx_spots_is_occupied ON spots(is_occupied);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_user_spots_spot_id ON user_spots(spot_id);
CREATE INDEX idx_user_spots_unique_code ON user_spots(unique_code);
CREATE INDEX idx_user_spots_released_at ON user_spots(released_at);

-- Insert sample data
INSERT INTO buildings (name, capacity) VALUES 
('Main Building', 50),
('East Wing', 30),
('West Wing', 40);

-- Generate spots for Main Building (2 floors, 25 spots per floor)
INSERT INTO spots (code, floor, building_id) 
SELECT 
  CONCAT('A', floor_num, '-', LPAD(spot_num::text, 2, '0')), 
  floor_num, 
  1
FROM generate_series(1, 2) AS floor_num,
     generate_series(1, 25) AS spot_num;

-- Generate spots for East Wing (1 floor, 30 spots)
INSERT INTO spots (code, floor, building_id) 
SELECT 
  CONCAT('B1-', LPAD(spot_num::text, 2, '0')), 
  1, 
  2
FROM generate_series(1, 30) AS spot_num;

-- Generate spots for West Wing (2 floors, 20 spots per floor)
INSERT INTO spots (code, floor, building_id) 
SELECT 
  CONCAT('C', floor_num, '-', LPAD(spot_num::text, 2, '0')), 
  floor_num, 
  3
FROM generate_series(1, 2) AS floor_num,
     generate_series(1, 20) AS spot_num;
