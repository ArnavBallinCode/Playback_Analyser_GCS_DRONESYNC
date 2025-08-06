"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Wifi, WifiOff, MapPin, Clock } from "lucide-react"
import { useAutoCollect } from "@/contexts/auto-collect-context"

interface ArenaCorner {
  lat: number
  lng: number
}

interface SafeSpot {
  id: string
  lat: number
  lng: number
}

interface JetsonData {
  arena: ArenaCorner[]
  safeSpots: SafeSpot[]
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

export default function DashboardSafeSpot() {
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
  const [detectedSpots, setDetectedSpots] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState('No Data')
  const [jetsonData, setJetsonData] = useState<JetsonData | null>(null)
  const [jetsonStatus, setJetsonStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastJetsonUpdate, setLastJetsonUpdate] = useState<string>('')
<<<<<<< HEAD

  // State for uploaded safe spots
  const [uploadedSafeSpots, setUploadedSafeSpots] = useState<SafeSpot[]>([])
  const [uploadedArena, setUploadedArena] = useState<ArenaCorner[]>([])

  // State for drone path trail
  const [dronePath, setDronePath] = useState<{ x: number, y: number }[]>([])
=======
  
  // State for uploaded safe spots
  const [uploadedSafeSpots, setUploadedSafeSpots] = useState<SafeSpot[]>([])
  const [uploadedArena, setUploadedArena] = useState<ArenaCorner[]>([])
  
  // State for drone path trail
  const [dronePath, setDronePath] = useState<{x: number, y: number}[]>([])
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
  const maxPathLength = 100 // Maximum number of points to keep in trail

  const { mode, playbackData, playbackIndex, isPlaybackPlaying } = useAutoCollect()

  // Detection threshold (0.5 meters)
  const DETECTION_THRESHOLD = 0.5

  // Calculate distance between two points
  const calculateDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
  }

<<<<<<< HEAD
  // Convert coordinates to local field coordinates - SIMPLIFIED
  const coordsToFieldCoords = (coords: { lat: number, lng: number }): { x: number, y: number } => {
    // For safe spots: lat = x coordinate, lng = y coordinate (direct field coordinates)
    // Expanded range: -9 to +9 (x), -13 to +13 (y)
    return {
      x: Math.max(-9, Math.min(9, coords.lat)),   // x coordinate (-9 to +9m)
      y: Math.max(-13, Math.min(13, coords.lng))  // y coordinate (-13 to +13m)
=======
  // Convert coordinates to local field coordinates
  const coordsToFieldCoords = (coords: { lat: number, lng: number }, arena: ArenaCorner[]): { x: number, y: number } => {
    if (arena.length < 4) {
      // Fallback to simple conversion if arena not available
      return {
        x: Math.max(0, Math.min(9, (coords.lat - 12.03) * 1000)),
        y: Math.max(0, Math.min(12, (coords.lng - 77.12) * 1000))
      }
    }

    // Find bounding box of arena
    const minLat = Math.min(...arena.map(c => c.lat))
    const maxLat = Math.max(...arena.map(c => c.lat))
    const minLng = Math.min(...arena.map(c => c.lng))
    const maxLng = Math.max(...arena.map(c => c.lng))

    // Convert coordinates to normalized coordinates (0-1)
    const normalizedX = (coords.lng - minLng) / (maxLng - minLng)
    const normalizedY = (coords.lat - minLat) / (maxLat - minLat)

    // Scale to field dimensions (9x12 meters)
    return {
      x: Math.max(0, Math.min(9, normalizedX * 9)),
      y: Math.max(0, Math.min(12, normalizedY * 12))
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
    }
  }

  // Fetch data from Jetson device - live data only
  const fetchJetsonData = async () => {
    try {
      const endpoint = '/api/jetson-data'

      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newData: JetsonData = await response.json()
      setJetsonData(newData)
      setLastJetsonUpdate(new Date().toLocaleTimeString())

      if (newData.status === 'success') {
        setJetsonStatus('connected')
        console.log('Safe spots data:', newData.safeSpots)
        console.log('Arena data:', newData.arena)
      } else {
        setJetsonStatus('error')
        console.error('Jetson data fetch error:', newData.error)
      }
    } catch (error) {
      console.error('Error fetching Jetson data:', error)
      setJetsonStatus('error')
    }
  }

  // Get position data from playback
  useEffect(() => {
    if (mode === 'playback' && playbackData.length > 0 && playbackIndex < playbackData.length) {
      const currentData = playbackData[playbackIndex]
<<<<<<< HEAD

      if (currentData) {
        // Extract position data from the current playback point
        let fieldX = 0, fieldY = 0

=======
      
      if (currentData) {
        // Extract position data from the current playback point
        let fieldX = 0, fieldY = 0
        
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
        // Try to get position from different possible data structures
        if (currentData.position) {
          // Historical data format
          const posData = currentData.position
<<<<<<< HEAD
          fieldX = Math.max(-9, Math.min(9, posData.x))
          fieldY = Math.max(-13, Math.min(13, posData.y))
=======
          fieldX = Math.max(0, Math.min(9, posData.x + 4.5))
          fieldY = Math.max(0, Math.min(12, posData.y + 6))
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
          setConnectionStatus(`Playback - Position (${playbackIndex + 1}/${playbackData.length})`)
        } else if (currentData.LOCAL_POSITION_NED) {
          // MAVLink format
          const localData = currentData.LOCAL_POSITION_NED
<<<<<<< HEAD
          fieldX = Math.max(-9, Math.min(9, localData.x))
          fieldY = Math.max(-13, Math.min(13, localData.y))
          setConnectionStatus(`Playback - NED (${localData.time_boot_ms || 'N/A'}ms)`)
        } else if (currentData.GLOBAL_POSITION_INT) {
          const globalData = currentData.GLOBAL_POSITION_INT
          fieldX = Math.max(-9, Math.min(9, (globalData.lat / 1000000) % 18 - 9))
          fieldY = Math.max(-13, Math.min(13, (globalData.lon / 1000000) % 26 - 13))
          setConnectionStatus(`Playback - Global (${globalData.time_boot_ms || 'N/A'}ms)`)
        } else if (currentData.x !== undefined && currentData.y !== undefined) {
          // Direct x,y coordinates
          fieldX = Math.max(-9, Math.min(9, currentData.x))
          fieldY = Math.max(-13, Math.min(13, currentData.y))
          setConnectionStatus(`Playback - Direct (${playbackIndex + 1}/${playbackData.length})`)
        }

        setCurrentPosition({ x: fieldX, y: fieldY })

=======
          fieldX = Math.max(0, Math.min(9, localData.x + 4.5))
          fieldY = Math.max(0, Math.min(12, localData.y + 6))
          setConnectionStatus(`Playback - NED (${localData.time_boot_ms || 'N/A'}ms)`)
        } else if (currentData.GLOBAL_POSITION_INT) {
          const globalData = currentData.GLOBAL_POSITION_INT
          fieldX = Math.max(0, Math.min(9, (globalData.lat / 1000000) % 9))
          fieldY = Math.max(0, Math.min(12, (globalData.lon / 1000000) % 12))
          setConnectionStatus(`Playback - Global (${globalData.time_boot_ms || 'N/A'}ms)`)
        } else if (currentData.x !== undefined && currentData.y !== undefined) {
          // Direct x,y coordinates
          fieldX = Math.max(0, Math.min(9, currentData.x + 4.5))
          fieldY = Math.max(0, Math.min(12, currentData.y + 6))
          setConnectionStatus(`Playback - Direct (${playbackIndex + 1}/${playbackData.length})`)
        }
        
        setCurrentPosition({ x: fieldX, y: fieldY })
        
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
        // Update drone path trail
        setDronePath(prevPath => {
          const newPath = [...prevPath, { x: fieldX, y: fieldY }]
          // Keep only the last maxPathLength points
          return newPath.length > maxPathLength ? newPath.slice(-maxPathLength) : newPath
        })
        setJetsonStatus('connected')
<<<<<<< HEAD

=======
        
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
        console.log(`Safespot position updated: Index ${playbackIndex}, X: ${fieldX}, Y: ${fieldY}`)
      }
    } else if (mode === 'playback') {
      setConnectionStatus('Playback Ready')
      setJetsonStatus('disconnected')
    } else {
      setConnectionStatus('No Data - Upload JSON file')
      setJetsonStatus('disconnected')
      setCurrentPosition({ x: 0, y: 0 })
      setDronePath([]) // Clear the trail when no data
    }
  }, [mode, playbackData, playbackIndex])

  // Auto-fetch Jetson data disabled for playback mode
  useEffect(() => {
    // Only use playback data, no external fetching
    console.log('Safespot component initialized for playback mode only')
  }, [])

  // Listen for uploaded safe spots
  useEffect(() => {
    const handleSafeSpotsUpload = (event: any) => {
      const { spots, arena } = event.detail
      setUploadedSafeSpots(spots)
<<<<<<< HEAD

=======
      
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
      // Convert arena object to array format
      if (arena) {
        const arenaArray = Object.values(arena) as ArenaCorner[]
        setUploadedArena(arenaArray)
      }
<<<<<<< HEAD

=======
      
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
      console.log('Safe spots uploaded to arena:', spots.length, 'spots')
    }

    window.addEventListener('safeSpotsUploaded', handleSafeSpotsUpload)
<<<<<<< HEAD

=======
    
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
    return () => {
      window.removeEventListener('safeSpotsUploaded', handleSafeSpotsUpload)
    }
  }, [])

  // Check if drone is at any safe spot (dynamic from Jetson data)
  useEffect(() => {
    if (!jetsonData?.safeSpots) return

    jetsonData.safeSpots.forEach(spot => {
      // Convert coordinate safe spot to field coordinates
<<<<<<< HEAD
      const spotFieldCoords = coordsToFieldCoords(spot)
=======
      const spotFieldCoords = coordsToFieldCoords(spot, jetsonData.arena)
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
      const distance = calculateDistance(currentPosition, spotFieldCoords)

      if (distance <= DETECTION_THRESHOLD && !detectedSpots.includes(spot.id)) {
        setDetectedSpots(prev => {
          const newDetected = [...prev, spot.id]

          // Check if this completes the mission (all 3 safe spots detected)
          if (newDetected.length === 3) {
            console.log('🏆 MISSION COMPLETE! All 3 safe spots detected!')
            alert(`� MISSION COMPLETE!\n\nAll 3 Safe Spots Detected!\n\nCongratulations! You have successfully completed the safe spot detection mission.`)
          } else {
            console.log(`�🎯 ${spot.id} Detected! Distance: ${distance.toFixed(2)}m (${newDetected.length}/3 complete)`)
            alert(`🎯 SAFE SPOT DETECTED!\n\n${spot.id}\nDistance: ${distance.toFixed(2)}m\nCoordinates: (${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)})\n\nProgress: ${newDetected.length}/3 safe spots`)
          }

          return newDetected
        })
      }
    })
  }, [currentPosition, jetsonData, detectedSpots])

<<<<<<< HEAD
  // Check if drone is at any uploaded safe spot
  useEffect(() => {
    if (uploadedSafeSpots.length === 0) return

    uploadedSafeSpots.forEach(spot => {
      // Convert coordinate safe spot to field coordinates
      const spotFieldCoords = coordsToFieldCoords(spot)
      const distance = calculateDistance(currentPosition, spotFieldCoords)

      if (distance <= DETECTION_THRESHOLD && !detectedSpots.includes(spot.id)) {
        setDetectedSpots(prev => {
          const newDetected = [...prev, spot.id]

          // Check if this completes the mission (all safe spots detected)
          if (newDetected.length === uploadedSafeSpots.length) {
            console.log('🏆 MISSION COMPLETE! All uploaded safe spots detected!')
            alert(`🏆 MISSION COMPLETE!\n\nAll ${uploadedSafeSpots.length} Uploaded Safe Spots Detected!\n\nCongratulations! You have successfully completed the safe spot detection mission.`)
          } else {
            console.log(`🎯 ${spot.id} Detected! Distance: ${distance.toFixed(2)}m (${newDetected.length}/${uploadedSafeSpots.length} complete)`)
            alert(`🎯 SAFE SPOT DETECTED!\n\n${spot.id}\nDistance: ${distance.toFixed(2)}m\nCoordinates: (${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)})\n\nProgress: ${newDetected.length}/${uploadedSafeSpots.length} safe spots`)
          }

          return newDetected
        })
      }
    })
  }, [currentPosition, uploadedSafeSpots, detectedSpots])

=======
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
  // Convert arena coordinates to field coordinates for visualization
  const getArenaFieldCoords = () => {
    if (!jetsonData?.arena || jetsonData.arena.length < 4) return []

    const minLat = Math.min(...jetsonData.arena.map(c => c.lat))
    const maxLat = Math.max(...jetsonData.arena.map(c => c.lat))
    const minLng = Math.min(...jetsonData.arena.map(c => c.lng))
    const maxLng = Math.max(...jetsonData.arena.map(c => c.lng))

    return jetsonData.arena.map(corner => ({
      x: ((corner.lng - minLng) / (maxLng - minLng)) * 9,
      y: ((corner.lat - minLat) / (maxLat - minLat)) * 12
    }))
  }

  const arenaFieldCoords = getArenaFieldCoords()
  return (
    <div className="h-full flex flex-col">

      {/* Dynamic Field Visualization */}
      <Card className="md:col-span-1 h-full flex flex-col">
        <CardHeader className="py-2 px-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold">Live Arena & Safe Spots</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 relative bg-green-50 dark:bg-green-950">
<<<<<<< HEAD
            <svg width="100%" height="100%" viewBox="-10 -14 20 28" className="absolute inset-0" preserveAspectRatio="xMidYMid meet">
              {/* Clipping definition - full expanded arena */}
              <defs>
                <clipPath id="fieldClip">
                  <rect x="-10" y="-14" width="20" height="28" />
                </clipPath>
              </defs>

              {/* Full expanded field boundary - EXPANDED FRAME (-9 to +9, -13 to +13) */}
              <rect x="-9" y="-13" width="18" height="26" className="fill-green-50 dark:fill-green-950" stroke="#000" strokeWidth="0.2" />

              {/* Grid lines (expanded) - FULL COORDINATE SYSTEM */}
              {[-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <line key={`v${i}`} x1={i} y1="-13" x2={i} y2="13" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.05" />
              ))}
              {[-13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
                <line key={`h${i}`} x1="-9" y1={i} x2="9" y2={i} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.05" />
=======
            <svg width="100%" height="100%" viewBox="-1 -1 11 14" className="absolute inset-0" preserveAspectRatio="xMidYMid meet">
              {/* Clipping definition - prevents any shifting of map */}
              <defs>
                <clipPath id="fieldClip">
                  <rect x="-1" y="-1" width="11" height="14" />
                </clipPath>
              </defs>

              {/* Expanded field boundary - FIXED FRAME */}
              <rect x="-1" y="-1" width="11" height="14" className="fill-green-50 dark:fill-green-950" stroke="#000" strokeWidth="0.1" />

              {/* Grid lines (expanded) - FIXED FRAME */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <line key={`v${i}`} x1={i} y1="-1" x2={i} y2="13" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.02" />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
                <line key={`h${i}`} x1="-1" y1={i} x2="10" y2={i} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.02" />
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
              ))}

              {/* All content within clipping bounds */}
              <g clipPath="url(#fieldClip)">
<<<<<<< HEAD
                {/* Full Expanded Arena Boundary - MAIN ARENA (-9 to +9, -13 to +13) */}
                <rect
                  x="-9"
                  y="-13"
                  width="18"
                  height="26"
                  fill="rgba(255,215,0,0.1)"
                  stroke="#FFD700"
                  strokeWidth="0.3"
                  strokeDasharray="0.6,0.2"
                />

                {/* Arena corners - EXPANDED */}
                {[[-9, -13], [9, -13], [9, 13], [-9, 13]].map(([x, y], index) => (
=======
                {/* Competition Arena Boundary - FIXED (9x12m) */}
                <rect
                  x="0"
                  y="0"
                  width="9"
                  height="12"
                  fill="rgba(255,215,0,0.1)"
                  stroke="#FFD700"
                  strokeWidth="0.15"
                  strokeDasharray="0.3,0.1"
                />

                {/* Arena corners - FIXED */}
                {[[0, 0], [9, 0], [9, 12], [0, 12]].map(([x, y], index) => (
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
<<<<<<< HEAD
                    r="0.3"
                    fill="#FFD700"
                    stroke="#000"
                    strokeWidth="0.1"
=======
                    r="0.15"
                    fill="#FFD700"
                    stroke="#000"
                    strokeWidth="0.03"
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                  />
                ))}

                {/* Dynamic Arena from Jetson (if different from fixed) */}
                {arenaFieldCoords.length >= 4 && (
                  <g opacity="0.5">
                    <polygon
<<<<<<< HEAD
                      points={arenaFieldCoords.map(p => `${p.x},${-p.y}`).join(' ')}
=======
                      points={arenaFieldCoords.map(p => `${p.x},${12 - p.y}`).join(' ')}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      fill="rgba(100,200,255,0.1)"
                      stroke="#64C8FF"
                      strokeWidth="0.08"
                      strokeDasharray="0.15,0.05"
                    />
                    {arenaFieldCoords.map((corner, index) => (
                      <circle
                        key={index}
                        cx={corner.x}
<<<<<<< HEAD
                        cy={-corner.y}
=======
                        cy={12 - corner.y}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                        r="0.1"
                        fill="#64C8FF"
                        stroke="#000"
                        strokeWidth="0.02"
                      />
                    ))}
                  </g>
                )}

                {/* Dynamic Safe spots from Jetson */}
                {jetsonData?.safeSpots?.map(spot => {
<<<<<<< HEAD
                  const spotCoords = coordsToFieldCoords(spot)
                  const isDetected = detectedSpots.includes(spot.id)
=======
                  const spotCoords = coordsToFieldCoords(spot, jetsonData.arena)
                  const isDetected = detectedSpots.includes(spot.id)
                  const isOutsideArena = spotCoords.x < 0 || spotCoords.x > 9 || spotCoords.y < 0 || spotCoords.y > 12
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec

                  return (
                    <g key={spot.id}>
                      {/* Detection radius circle */}
                      <circle
                        cx={spotCoords.x}
<<<<<<< HEAD
                        cy={-spotCoords.y}
                        r={DETECTION_THRESHOLD}
                        fill={isDetected ? "rgba(0,255,0,0.2)" : "rgba(0,102,204,0.1)"}
                        stroke={isDetected ? "#00ff00" : "#0066cc"}
                        strokeWidth="0.1"
                        strokeDasharray="0.2,0.2"
=======
                        cy={12 - spotCoords.y}
                        r={DETECTION_THRESHOLD}
                        fill={isDetected ? "rgba(0,255,0,0.2)" : "rgba(0,102,204,0.1)"}
                        stroke={isDetected ? "#00ff00" : "#0066cc"}
                        strokeWidth="0.03"
                        strokeDasharray="0.1,0.1"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      >
                        {/* Pulsing animation for detected spots */}
                        {isDetected && (
                          <animate attributeName="r" values={`${DETECTION_THRESHOLD};${DETECTION_THRESHOLD * 1.5};${DETECTION_THRESHOLD}`} dur="2s" repeatCount="indefinite" />
                        )}
                      </circle>

                      {/* Safe spot marker */}
                      <rect
<<<<<<< HEAD
                        x={spotCoords.x - 1.25}
                        y={-spotCoords.y - 1.25}
                        width="2.5"
                        height="2.5"
                        fill={isDetected ? "#00ff00" : "#0066cc"}
                        stroke="#000"
                        strokeWidth="0.1"
=======
                        x={spotCoords.x - 0.2}
                        y={12 - spotCoords.y - 0.2}
                        width="0.4"
                        height="0.4"
                        fill={isDetected ? "#00ff00" : "#0066cc"}
                        stroke="#000"
                        strokeWidth="0.02"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      />

                      {/* Spot label */}
                      <text
                        x={spotCoords.x}
<<<<<<< HEAD
                        y={-spotCoords.y + 1.2}
                        textAnchor="middle"
                        fontSize="0.6"
                        className="fill-black dark:fill-white"
                        fontWeight="bold"
=======
                        y={12 - spotCoords.y + 0.6}
                        textAnchor="middle"
                        fontSize="0.25"
                        className="fill-black dark:fill-white"
                        fontWeight="bold"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      >
                        {spot.id}
                      </text>

                      {/* Field coordinates display */}
                      <text
                        x={spotCoords.x}
<<<<<<< HEAD
                        y={-spotCoords.y + 1.8}
                        textAnchor="middle"
                        fontSize="0.4"
                        className="fill-gray-600 dark:fill-gray-400"
                      >
                        ({spotCoords.x.toFixed(1)}m, {spotCoords.y.toFixed(1)}m)
                      </text>
=======
                        y={12 - spotCoords.y + 0.9}
                        textAnchor="middle"
                        fontSize="0.15"
                        className="fill-gray-600 dark:fill-gray-400"
                        opacity={isOutsideArena ? 0.5 : 1}
                      >
                        ({spotCoords.x.toFixed(1)}m, {spotCoords.y.toFixed(1)}m)
                      </text>

                      {/* Out of bounds indicator */}
                      {isOutsideArena && (
                        <text
                          x={spotCoords.x}
                          y={12 - spotCoords.y - 0.3}
                          textAnchor="middle"
                          fontSize="0.15"
                          fill="#ff0000"
                          fontWeight="bold"
                        >
                          OUT
                        </text>
                      )}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                    </g>
                  )
                })}

                {/* Uploaded Safe spots from TXT file */}
                {uploadedSafeSpots.map(spot => {
<<<<<<< HEAD
                  const spotCoords = coordsToFieldCoords(spot)
                  const isDetected = detectedSpots.includes(spot.id)
=======
                  const spotCoords = coordsToFieldCoords(spot, uploadedArena.length > 0 ? uploadedArena : [])
                  const isDetected = detectedSpots.includes(spot.id)
                  const isOutsideArena = spotCoords.x < 0 || spotCoords.x > 9 || spotCoords.y < 0 || spotCoords.y > 12
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec

                  return (
                    <g key={`uploaded-${spot.id}`}>
                      {/* Detection radius circle */}
                      <circle
                        cx={spotCoords.x}
<<<<<<< HEAD
                        cy={-spotCoords.y}
                        r={DETECTION_THRESHOLD}
                        fill={isDetected ? "rgba(0,255,0,0.2)" : "rgba(0,102,204,0.1)"}
                        stroke={isDetected ? "#00ff00" : "#0066cc"}
                        strokeWidth="0.1"
                        strokeDasharray="0.2,0.2"
=======
                        cy={12 - spotCoords.y}
                        r={DETECTION_THRESHOLD}
                        fill={isDetected ? "rgba(0,255,0,0.2)" : "rgba(0,102,204,0.1)"}
                        stroke={isDetected ? "#00ff00" : "#0066cc"}
                        strokeWidth="0.03"
                        strokeDasharray="0.1,0.1"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      >
                        {/* Pulsing animation for detected spots */}
                        {isDetected && (
                          <animate attributeName="r" values={`${DETECTION_THRESHOLD};${DETECTION_THRESHOLD * 1.5};${DETECTION_THRESHOLD}`} dur="2s" repeatCount="indefinite" />
                        )}
                      </circle>

                      {/* Safe spot marker (blue square for uploaded spots) */}
                      <rect
<<<<<<< HEAD
                        x={spotCoords.x - 1.25}
                        y={-spotCoords.y - 1.25}
                        width="2.5"
                        height="2.5"
                        fill={isDetected ? "#00ff00" : "#0066cc"}
                        stroke="#000"
                        strokeWidth="0.1"
=======
                        x={spotCoords.x - 0.2}
                        y={12 - spotCoords.y - 0.2}
                        width="0.4"
                        height="0.4"
                        fill={isDetected ? "#00ff00" : "#0066cc"}
                        stroke="#000"
                        strokeWidth="0.02"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      />

                      {/* Spot label */}
                      <text
                        x={spotCoords.x}
<<<<<<< HEAD
                        y={-spotCoords.y + 1.2}
                        textAnchor="middle"
                        fontSize="0.6"
                        className="fill-blue-600 dark:fill-blue-400"
                        fontWeight="bold"
=======
                        y={12 - spotCoords.y + 0.6}
                        textAnchor="middle"
                        fontSize="0.25"
                        className="fill-blue-600 dark:fill-blue-400"
                        fontWeight="bold"
                        opacity={isOutsideArena ? 0.5 : 1}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      >
                        {spot.id}
                      </text>

                      {/* Field coordinates display */}
                      <text
                        x={spotCoords.x}
<<<<<<< HEAD
                        y={-spotCoords.y + 1.8}
                        textAnchor="middle"
                        fontSize="0.4"
                        className="fill-blue-500 dark:fill-blue-300"
                      >
                        ({spotCoords.x.toFixed(1)}m, {spotCoords.y.toFixed(1)}m)
                      </text>
=======
                        y={12 - spotCoords.y + 0.9}
                        textAnchor="middle"
                        fontSize="0.15"
                        className="fill-blue-500 dark:fill-blue-300"
                        opacity={isOutsideArena ? 0.5 : 1}
                      >
                        ({spotCoords.x.toFixed(1)}m, {spotCoords.y.toFixed(1)}m)
                      </text>

                      {/* Out of bounds indicator */}
                      {isOutsideArena && (
                        <text
                          x={spotCoords.x}
                          y={12 - spotCoords.y - 0.3}
                          textAnchor="middle"
                          fontSize="0.15"
                          fill="#ff0000"
                          fontWeight="bold"
                        >
                          OUT
                        </text>
                      )}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                    </g>
                  )
                })}

                {/* Drone path trail */}
                {dronePath.length > 1 && (
                  <g>
                    {/* Trail line */}
                    <polyline
<<<<<<< HEAD
                      points={dronePath.map(point => `${point.x},${-point.y}`).join(' ')}
=======
                      points={dronePath.map(point => `${point.x},${12 - point.y}`).join(' ')}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                      fill="none"
                      stroke="#ff0000"
                      strokeWidth="0.05"
                      opacity="0.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Trail points with gradient opacity */}
                    {dronePath.map((point, index) => {
                      const opacity = (index + 1) / dronePath.length * 0.6; // Fade from 0 to 0.6
                      return (
                        <circle
                          key={index}
                          cx={point.x}
<<<<<<< HEAD
                          cy={-point.y}
=======
                          cy={12 - point.y}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                          r="0.03"
                          fill="#ff0000"
                          opacity={opacity}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Current drone position */}
                <g>
<<<<<<< HEAD
                  <circle
                    cx={currentPosition.x}
                    cy={-currentPosition.y}
                    r="0.4"
                    fill="rgba(255,0,0,0.3)"
                    stroke="none"
                  />
                  <circle
                    cx={currentPosition.x}
                    cy={-currentPosition.y}
                    r="0.25"
                    fill="#ff0000"
                    stroke="#000000"
                    strokeWidth="0.05"
                  />
                  <circle
                    cx={currentPosition.x}
                    cy={-currentPosition.y}
                    r="0.12"
                    fill="#ffff00"
                    stroke="#000000"
                    strokeWidth="0.02"
                  />

                  {/* Pulse animation circle */}
                  <circle
                    cx={currentPosition.x}
                    cy={-currentPosition.y}
                    r="0.3"
                    fill="none"
                    stroke="#ff0000"
                    strokeWidth="0.03"
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Drone coordinates display */}
                  <text
                    x={currentPosition.x}
                    y={-currentPosition.y - 1.0}
                    textAnchor="middle"
                    fontSize="0.35"
                    className="fill-red-600 dark:fill-red-400"
                    fontWeight="bold"
                  >
                    ({currentPosition.x.toFixed(1)}, {currentPosition.y.toFixed(1)})
                  </text>
=======
                  {(() => {
                    const isOutsideArena = currentPosition.x < 0 || currentPosition.x > 9 || currentPosition.y < 0 || currentPosition.y > 12

                    return (
                      <>
                        <circle
                          cx={currentPosition.x}
                          cy={12 - currentPosition.y}
                          r="0.4"
                          fill="rgba(255,0,0,0.3)"
                          stroke="none"
                        />
                        <circle
                          cx={currentPosition.x}
                          cy={12 - currentPosition.y}
                          r="0.25"
                          fill={isOutsideArena ? "#ff8800" : "#ff0000"}
                          stroke="#000000"
                          strokeWidth="0.05"
                        />
                        <circle
                          cx={currentPosition.x}
                          cy={12 - currentPosition.y}
                          r="0.12"
                          fill="#ffff00"
                          stroke="#000000"
                          strokeWidth="0.02"
                        />

                        {/* Pulse animation circle */}
                        <circle
                          cx={currentPosition.x}
                          cy={12 - currentPosition.y}
                          r="0.3"
                          fill="none"
                          stroke={isOutsideArena ? "#ff8800" : "#ff0000"}
                          strokeWidth="0.03"
                          opacity="0.6"
                        >
                          <animate attributeName="r" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>

                        {/* Out of arena warning */}
                        {isOutsideArena && (
                          <text
                            x={currentPosition.x}
                            y={12 - currentPosition.y - 0.6}
                            textAnchor="middle"
                            fontSize="0.2"
                            fill="#ff0000"
                            fontWeight="bold"
                          >
                            OUT OF ARENA
                          </text>
                        )}
                      </>
                    )
                  })()}
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                </g>
              </g>

              {/* Fixed coordinates display */}
<<<<<<< HEAD
              <text x="0" y="-12" textAnchor="middle" fontSize="0.3" className="fill-gray-600 dark:fill-gray-400">
                Expanded Arena: 18×26m (-9 to +9, -13 to +13)
              </text>

              {/* Center axis labels */}
              <text x="0" y="14" textAnchor="middle" fontSize="0.25" className="fill-gray-500 dark:fill-gray-400">
                Center (0,0) • Up = +Y, Down = -Y • Right = +X, Left = -X
              </text>

              {/* Mission Complete Banner */}
              {(detectedSpots.length === 3 || (uploadedSafeSpots.length > 0 && detectedSpots.length === uploadedSafeSpots.length)) && (
                <>
                  <rect x="-3" y="-1" width="6" height="2" fill="rgba(0,255,0,0.8)" stroke="#00ff00" strokeWidth="0.1" rx="0.2" />
                  <text x="0" y="0.2" textAnchor="middle" fontSize="0.4" fill="#000" fontWeight="bold">
                    🏆 MISSION COMPLETE! 🏆
                  </text>
                  <text x="0" y="0.6" textAnchor="middle" fontSize="0.2" fill="#000">
                    All {uploadedSafeSpots.length > 0 ? uploadedSafeSpots.length : 3} Safe Spots Detected!
=======
              <text x="4.5" y="0.5" textAnchor="middle" fontSize="0.3" className="fill-gray-600 dark:fill-gray-400">
                Arena: 9×12m Competition Zone
              </text>

              {/* Mission Complete Banner */}
              {detectedSpots.length === 3 && (
                <>
                  <rect x="1" y="5" width="7" height="2" fill="rgba(0,255,0,0.8)" stroke="#00ff00" strokeWidth="0.1" rx="0.2" />
                  <text x="4.5" y="6.2" textAnchor="middle" fontSize="0.4" fill="#000" fontWeight="bold">
                    🏆 MISSION COMPLETE! 🏆
                  </text>
                  <text x="4.5" y="6.6" textAnchor="middle" fontSize="0.2" fill="#000">
                    All 3 Safe Spots Detected!
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                  </text>
                </>
              )}
            </svg>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}