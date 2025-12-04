'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Building = {
  id: number
  name: string
  capacity: number
  created_at: string
}

type User = {
  id: number
  name: string
  card_id: string
  user_type: 'car_owner' | 'building_owner'
}

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [cardId, setCardId] = useState('')

  useEffect(() => {
    fetchBuildings()
    // Check if user is already logged in (stored in localStorage)
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('card_id', cardId)
        .single()
      
      if (error || !data) {
        alert('User not found. Please register first.')
        return
      }
      
      setCurrentUser(data)
      localStorage.setItem('currentUser', JSON.stringify(data))
      setShowLoginForm(false)
      setCardId('')
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

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
          <h1 className="text-2xl font-bold">Parking Lot Management</h1>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span>Welcome, {currentUser.name}</span>
                <span className="text-parking-green">({currentUser.user_type.replace('_', ' ')})</span>
                <button 
                  onClick={handleLogout}
                  className="bg-parking-green hover:bg-parking-dark-green px-4 py-2 rounded text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="bg-parking-green hover:bg-parking-dark-green px-4 py-2 rounded text-white"
                >
                  Login
                </button>
                <Link 
                  href="/register"
                  className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded border"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="cardId" className="block text-black mb-2">Card ID</label>
                <input
                  type="text"
                  id="cardId"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Enter your card ID"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-parking-green hover:bg-parking-dark-green text-white px-4 py-2 rounded"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {!currentUser ? (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-black mb-4">Welcome to Parking Lot Management</h2>
            <p className="text-gray-600 mb-8">Please register or login to use the parking system</p>
            <Link 
              href="/register"
              className="bg-parking-green hover:bg-parking-dark-green text-white px-8 py-3 rounded-lg text-lg"
            >
              Get Started - Register Now
            </Link>
          </div>
        ) : (
          <div>
            {/* Building Owner Dashboard Link */}
            {currentUser.user_type === 'building_owner' && (
              <div className="mb-6">
                <Link 
                  href="/admin"
                  className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 inline-block"
                >
                  Building Owner Dashboard
                </Link>
              </div>
            )}

            {/* Buildings List */}
            <h2 className="text-2xl font-bold text-black mb-6">Available Buildings</h2>
            
            {buildings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No buildings available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map((building) => (
                  <div key={building.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-black mb-2">{building.name}</h3>
                    <p className="text-gray-600 mb-4">Capacity: {building.capacity} spots</p>
                    
                    {currentUser.user_type === 'car_owner' ? (
                      <Link 
                        href={`/buildings/${building.id}`}
                        className="bg-parking-green hover:bg-parking-dark-green text-white px-4 py-2 rounded inline-block w-full text-center"
                      >
                        View Available Spots
                      </Link>
                    ) : (
                      <div className="text-gray-500 text-center py-2">
                        Building Details
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
