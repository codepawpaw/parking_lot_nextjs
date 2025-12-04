'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserType = 'car_owner' | 'building_owner'

export default function Register() {
  const [userType, setUserType] = useState<UserType>('car_owner')
  const [name, setName] = useState('')
  const [cardId, setCardId] = useState('')
  const [vehicles, setVehicles] = useState([''])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addVehicle = () => {
    setVehicles([...vehicles, ''])
  }

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index))
    }
  }

  const updateVehicle = (index: number, value: string) => {
    const newVehicles = [...vehicles]
    newVehicles[index] = value
    setVehicles(newVehicles)
  }

  const generateCardId = () => {
    const randomId = 'CARD-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    setCardId(randomId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Insert user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          card_id: cardId.trim(),
          user_type: userType,
        })
        .select()
        .single()

      if (userError) throw userError

      // If car owner, insert vehicles
      if (userType === 'car_owner' && vehicles.some(v => v.trim())) {
        const validVehicles = vehicles
          .filter(v => v.trim())
          .map(plateNumber => ({
            plate_number: plateNumber.trim().toUpperCase(),
            user_id: userData.id,
          }))

        if (validVehicles.length > 0) {
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert(validVehicles)

          if (vehicleError) throw vehicleError
        }
      }

      alert('Registration successful! You can now login.')
      router.push('/')
    } catch (error: any) {
      console.error('Registration error:', error)
      alert('Registration failed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Parking Lot Management</Link>
          <Link href="/" className="bg-parking-green hover:bg-parking-dark-green px-4 py-2 rounded">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Registration Form */}
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-black mb-6 text-center">Register</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-black font-medium mb-3">User Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUserType('car_owner')}
                  className={`flex-1 py-3 px-4 rounded border ${
                    userType === 'car_owner'
                      ? 'bg-parking-green text-white border-parking-green'
                      : 'bg-white text-black border-gray-300 hover:border-parking-green'
                  }`}
                >
                  Car Owner
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('building_owner')}
                  className={`flex-1 py-3 px-4 rounded border ${
                    userType === 'building_owner'
                      ? 'bg-parking-green text-white border-parking-green'
                      : 'bg-white text-black border-gray-300 hover:border-parking-green'
                  }`}
                >
                  Building Owner
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-black font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-parking-green"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Card ID */}
            <div>
              <label htmlFor="cardId" className="block text-black font-medium mb-2">
                Card ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="cardId"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-parking-green"
                  placeholder="Enter or generate card ID"
                  required
                />
                <button
                  type="button"
                  onClick={generateCardId}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Generate
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This will be used to login to the system
              </p>
            </div>

            {/* Vehicles (only for car owners) */}
            {userType === 'car_owner' && (
              <div>
                <label className="block text-black font-medium mb-2">
                  Vehicle Plate Numbers
                </label>
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={vehicle}
                      onChange={(e) => updateVehicle(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-parking-green"
                      placeholder="e.g., ABC-1234"
                    />
                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVehicle}
                  className="bg-parking-green hover:bg-parking-dark-green text-white px-4 py-2 rounded mt-2"
                >
                  Add Another Vehicle
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Add all vehicles you plan to park
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-parking-green hover:bg-parking-dark-green'
              }`}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/" className="text-parking-green hover:text-parking-dark-green">
                Go back and login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
