# Parking Lot Management System

A comprehensive parking lot management system built with Next.js, Supabase, and Tailwind CSS

## Features

### User Types
- **Car Owners**: Can register vehicles, view available parking spots, book spots, and release spots
- **Building Owners**: Can create buildings, manage spots, and view real-time metrics

### Core Functionality

#### Car Owner Features
1. **Registration**: Create account with name and vehicle plate numbers
2. **Login**: Secure login using card ID
3. **Building Selection**: Browse available buildings
4. **Spot Booking**: View available spots by floor and book parking
5. **Unique Code System**: Receive unique codes for parking sessions
6. **Spot Release**: Use unique code to release parking spots

#### Building Owner Features
1. **Registration**: Create building owner account
2. **Building Management**: Create new buildings with capacity and floor specifications
3. **Real-time Metrics**: Monitor occupancy rates, available spots, and active sessions
4. **Active Sessions**: View current parking sessions with duration tracking

### Technical Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL database)
- **Styling**: Tailwind CSS with custom color scheme (white, black, green)
- **Authentication**: Simple card ID based system
- **Real-time Updates**: Supabase real-time subscriptions

### Database Schema

#### Tables
1. **buildings**: Building information (id, name, capacity)
2. **spots**: Parking spots (id, code, floor, building_id, is_occupied)
3. **users**: User accounts (id, name, card_id, user_type)
4. **vehicles**: User vehicles (id, plate_number, user_id)
5. **user_spots**: Parking sessions (id, spot_id, unique_code, vehicle_id, parked_at, released_at)
