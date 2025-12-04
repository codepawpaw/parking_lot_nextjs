'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Building = {
  id: number
  name: string
  capacity: number
  created_at: string
}

type Spot = {
  id: number
  code: string
  floor: number
  building_id: number
  is_occupied: boolean
  created_at: string
}

type User = {
  id: number
  name: string
  card_id: string
  user_type: 'car_owner' | 'building_owner'
}

type ParkingSession = {
  id: number
  spot_id: number
  unique_code: string
  vehicle_id: number
  parked_at: string
  released_at: string | null
  spots: Spot
  vehicles: {
    plate_number: string
    users: {
      name: string
    }
  }
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [buildingSpots, setBuildingSpots] = useState<Spot[]>([])
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([])
  const [showNewBuildingForm, setShowNewBuildingForm] = useState(false)
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    capacity: 0,
    floors: 1
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) {
      router.push('/')
      return
    }

    const user = JSON.parse(storedUser)
    if (user.user_type !== 'building_owner') {
      alert('Access denied. This page is for building owners only.')
      router.push('/')
      return
    }

    setCurrentUser(user)
    fetchBuildings()
  }, [])

  useEffect(() => {
    if (selectedBuilding) {
      fetchBuildingSpots()
      fetchActiveSessions()
    }
  }, [selectedBuilding])

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setBuildings(data || [])
    } catch (error) {
      console.error('Error fetching buildings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuildingSpots = async () => {
    if (!selectedBuilding) return

    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('building_id', selectedBuilding.id)
        .order('floor', { ascending: true })
        .order('code', { ascending: true })
      
      if (error) throw error
      setBuildingSpots(data || [])
    } catch (error) {
      console.error('Error fetching building spots:', error)
    }
  }

  const fetchActiveSessions = async () => {
    if (!selectedBuilding) return

    try {
      const { data, error } = await supabase
        .from('user_spots')
        .select(`
          *,
          spots!inner(*),
          vehicles!inner(
            plate_number,
            users!inner(name)
          )
        `)
        .eq('spots.building_id', selectedBuilding.id)
        .is('released_at', null)
        .order('parked_at', { ascending: false })
      
      if (error) throw error
      setActiveSessions(data || [])
    } catch (error) {
      console.error('Error fetching active sessions:', error)
    }
  }

  const generateSpots = (buildingId: number, capacity: number, floors: number) => {
    const spots = []
    const spotsPerFloor = Math.ceil(capacity / floors)
    
    for (let floor = 1; floor <= floors; floor++) {
      const spotsForThisFloor = floor === floors 
        ? capacity - (spotsPerFloor * (floors - 1))
        : spotsPerFloor

      for (let spotNum = 1; spotNum <= spotsForThisFloor; spotNum++) {
        const code = `${String.fromCharCode(64 + buildingId)}${floor}-${spotNum.toString().padStart(2, '0')}`
        spots.push({
          code,
          floor,
          building_id: buildingId,
          is_occupied: false
        })
      }
    }
    
    return spots
  }

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create building
      const { data: buildingData, error: buildingError } = await supabase
        .from('buildings')
        .insert({
          name: newBuilding.name.trim(),
          capacity: newBuilding.capacity,
        })
        .select()
        .single()

      if (buildingError) throw buildingError

      // Generate and create spots
      const spotsToInsert = generateSpots(
        buildingData.id,
        newBuilding.capacity,
        newBuilding.floors
      )

      const { error: spotsError } = await supabase
        .from('spots')
        .insert(spotsToInsert)

      if (spotsError) throw spotsError

      alert('Building created successfully!')
      setShowNewBuildingForm(false)
      setNewBuilding({ name: '', capacity: 0, floors: 1 })
      fetchBuildings()
    } catch (error: any) {
      console.error('Error creating building:', error)
      alert('Failed to create building: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getBuildingStats = () => {
    if (!selectedBuilding || buildingSpots.length === 0) {
      return {
        total: 0,
        occupied: 0,
        available: 0,
        occupancyRate: 0
      }
    }

    const total = buildingSpots.length
    const occupied = buildingSpots.filter(spot => spot.is_occupied).length
    const available = total - occupied
    const occupancyRate = (occupied / total) * 100

    return {
      total,
      occupied,
      available,
      occupancyRate: Math.round(occupancyRate * 10) / 10
    }
  }

  const stats = getBuildingStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black">Loading...</div>
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
                <span>Welcome, {currentUser.name} (Building Owner)</span>
                <Link href="/" className="bg-parking-green hover:bg-parking-dark-green px-4 py-2 rounded">
                  Back to Home
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">Building Owner Dashboard</h1>
          
          {/* Create New Building Button */}
          <button 
            onClick={() => setShowNewBuildingForm(true)}
            className="bg-parking-green hover:bg-parking-dark-green text-white px-6 py-3 rounded mb-6"
          >
            Create New Building
          </button>

          {/* Buildings Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Select Building to Manage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildings.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedBuilding?.id === building.id
                      ? 'bg-parking-green text-white border-parking-dark-green'
                      : 'bg-white text-black border-gray-300 hover:border-parking-green'
                  }`}
                >
                  <h3 className="font-bold">{building.name}</h3>
                  <p className={selectedBuilding?.id === building.id ? 'text-white' : 'text-gray-600'}>
                    Capacity: {building.capacity} spots
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Building Details and Stats */}
        {selectedBuilding && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">{selectedBuilding.name} - Real-time Metrics</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Total Spots</h3>
                  <p className="text-3xl font-bold text-black">{stats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Occupied</h3>
                  <p className="text-3xl font-bold text-red-500">{stats.occupied}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Available</h3>
                  <p className="text-3xl font-bold text-parking-green">{stats.available}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Occupancy Rate</h3>
                  <p className="text-3xl font-bold text-black">{stats.occupancyRate}%</p>
                </div>
              </div>
            </div>

            {/* Active Parking Sessions */}
            <div>
              <h3 className="text-xl font-bold text-black mb-4">Active Parking Sessions</h3>
              {activeSessions.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No active parking sessions</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Parked At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeSessions.map((session) => {
                        const parkedAt = new Date(session.parked_at)
                        const duration = Math.floor((Date.now() - parkedAt.getTime()) / (1000 * 60)) // minutes
                        
                        return (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {session.spots.code} (Floor {session.spots.floor})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.vehicles.plate_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.vehicles.users.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {parkedAt.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {duration < 60 ? `${duration}m` : `${Math.floor(duration/60)}h ${duration%60}m`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Building Modal */}
      {showNewBuildingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Create New Building</h2>
            <form onSubmit={handleCreateBuilding}>
              <div className="mb-4">
                <label htmlFor="buildingName" className="block text-black mb-2">Building Name</label>
                <input
                  type="text"
                  id="buildingName"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Enter building name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="capacity" className="block text-black mb-2">Total Capacity (spots)</label>
                <input
                  type="number"
                  id="capacity"
                  min="1"
                  value={newBuilding.capacity || ''}
                  onChange={(e) => setNewBuilding({...newBuilding, capacity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Enter total number of spots"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="floors" className="block text-black mb-2">Number of Floors</label>
                <input
                  type="number"
                  id="floors"
                  min="1"
                  max="10"
                  value={newBuilding.floors}
                  onChange={(e) => setNewBuilding({...newBuilding, floors: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Enter number of floors"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded text-white ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-parking-green hover:bg-parking-dark-green'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Building'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewBuildingForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
