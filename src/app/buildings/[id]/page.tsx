'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Spot = {
  id: number
  code: string
  floor: number
  building_id: number
  is_occupied: boolean
  created_at: string
}

type Building = {
  id: number
  name: string
  capacity: number
  created_at: string
}

type Vehicle = {
  id: number
  plate_number: string
  user_id: number
}

type User = {
  id: number
  name: string
  card_id: string
  user_type: 'car_owner' | 'building_owner'
}

export default function BuildingSpots({ params }: { params: { id: string } }) {
  const [building, setBuilding] = useState<Building | null>(null)
  const [spots, setSpots] = useState<Spot[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [releaseCode, setReleaseCode] = useState('')
  const [groupedSpots, setGroupedSpots] = useState<Record<number, Spot[]>>({})
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) {
      router.push('/')
      return
    }
    setCurrentUser(JSON.parse(storedUser))
    
    fetchBuildingData()
    fetchSpots()
    fetchUserVehicles(JSON.parse(storedUser))
  }, [params.id])

  useEffect(() => {
    // Group spots by floor
    const grouped = spots.reduce((acc, spot) => {
      if (!acc[spot.floor]) {
        acc[spot.floor] = []
      }
      acc[spot.floor].push(spot)
      return acc
    }, {} as Record<number, Spot[]>)
    
    setGroupedSpots(grouped)
  }, [spots])

  const fetchBuildingData = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      setBuilding(data)
    } catch (error) {
      console.error('Error fetching building:', error)
    }
  }

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('building_id', params.id)
        .order('floor', { ascending: true })
        .order('code', { ascending: true })
      
      if (error) throw error
      setSpots(data || [])
    } catch (error) {
      console.error('Error fetching spots:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserVehicles = async (user: User) => {
    if (user.user_type !== 'car_owner') return

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
      
      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const generateUniqueCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleSpotClick = (spot: Spot) => {
    if (!currentUser || currentUser.user_type !== 'car_owner') return
    
    if (spot.is_occupied) {
      alert('This spot is already occupied')
      return
    }

    setSelectedSpot(spot)
    setShowBookingModal(true)
  }

  const handleBookSpot = async () => {
    if (!selectedSpot || !selectedVehicle || !currentUser) return

    try {
      const uniqueCode = generateUniqueCode()
      
      // Create parking session
      const { error: sessionError } = await supabase
        .from('user_spots')
        .insert({
          spot_id: selectedSpot.id,
          unique_code: uniqueCode,
          vehicle_id: selectedVehicle,
          parked_at: new Date().toISOString(),
        })

      if (sessionError) throw sessionError

      // Update spot status
      const { error: spotError } = await supabase
        .from('spots')
        .update({ is_occupied: true })
        .eq('id', selectedSpot.id)

      if (spotError) throw spotError

      alert(`Parking booked successfully!\nYour unique code is: ${uniqueCode}\n\nPlease save this code - you'll need it to release the spot.`)
      
      setShowBookingModal(false)
      setSelectedSpot(null)
      setSelectedVehicle(null)
      fetchSpots() // Refresh spots
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to book spot. Please try again.')
    }
  }

  const handleReleaseSpot = async () => {
    if (!releaseCode.trim()) {
      alert('Please enter your unique code')
      return
    }

    try {
      // Find active parking session
      const { data: session, error: sessionError } = await supabase
        .from('user_spots')
        .select('*, spots(*), vehicles(*)')
        .eq('unique_code', releaseCode.trim().toUpperCase())
        .is('released_at', null)
        .single()

      if (sessionError || !session) {
        alert('Invalid code or parking session not found')
        return
      }

      // Update session with release time
      const { error: updateSessionError } = await supabase
        .from('user_spots')
        .update({ released_at: new Date().toISOString() })
        .eq('id', session.id)

      if (updateSessionError) throw updateSessionError

      // Update spot status
      const { error: spotError } = await supabase
        .from('spots')
        .update({ is_occupied: false })
        .eq('id', session.spot_id)

      if (spotError) throw spotError

      alert(`Spot ${session.spots.code} has been released successfully!`)
      
      setShowReleaseModal(false)
      setReleaseCode('')
      fetchSpots() // Refresh spots
    } catch (error) {
      console.error('Release error:', error)
      alert('Failed to release spot. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black">Loading...</div>
      </div>
    )
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto p-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-black mb-4">Building Not Found</h1>
            <Link href="/" className="bg-parking-green text-white px-6 py-3 rounded">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Parking Lot Management</Link>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <span>Welcome, {currentUser.name}</span>
                <button 
                  onClick={() => setShowReleaseModal(true)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
                >
                  Release Spot
                </button>
                <Link href="/" className="bg-parking-green hover:bg-parking-dark-green px-4 py-2 rounded">
                  Back to Buildings
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Building Info */}
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{building.name}</h1>
          <p className="text-gray-600">
            Total Capacity: {building.capacity} spots | 
            Available: {spots.filter(s => !s.is_occupied).length} | 
            Occupied: {spots.filter(s => s.is_occupied).length}
          </p>
        </div>

        {/* Spots by Floor */}
        {Object.keys(groupedSpots).map(floor => (
          <div key={floor} className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Floor {floor}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {groupedSpots[parseInt(floor)].map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  disabled={spot.is_occupied || currentUser?.user_type !== 'car_owner'}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    spot.is_occupied
                      ? 'bg-red-500 text-white border-red-600 cursor-not-allowed'
                      : currentUser?.user_type === 'car_owner'
                      ? 'bg-parking-green text-white border-parking-dark-green hover:bg-parking-dark-green cursor-pointer'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                >
                  <div className="text-sm">{spot.code}</div>
                  <div className="text-xs mt-1">
                    {spot.is_occupied ? 'Occupied' : 'Available'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {spots.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No parking spots available in this building</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Book Parking Spot</h2>
            <p className="text-gray-600 mb-4">
              Spot: {selectedSpot?.code} (Floor {selectedSpot?.floor})
            </p>
            
            <div className="mb-4">
              <label className="block text-black mb-2">Select Vehicle</label>
              <select
                value={selectedVehicle || ''}
                onChange={(e) => setSelectedVehicle(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
              >
                <option value="">Choose a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleBookSpot}
                disabled={!selectedVehicle}
                className={`flex-1 px-4 py-2 rounded text-white ${
                  selectedVehicle
                    ? 'bg-parking-green hover:bg-parking-dark-green'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Book Spot
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Release Parking Spot</h2>
            <div className="mb-4">
              <label htmlFor="releaseCode" className="block text-black mb-2">
                Enter Unique Code
              </label>
              <input
                type="text"
                id="releaseCode"
                value={releaseCode}
                onChange={(e) => setReleaseCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Enter your 6-digit code"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReleaseSpot}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Release Spot
              </button>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
