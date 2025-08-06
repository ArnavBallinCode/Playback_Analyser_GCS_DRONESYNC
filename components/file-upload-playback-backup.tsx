"use client"

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, Pause, Square, Upload, FileText, MapPin, Activity } from 'lucide-react'
import { useAutoCollect } from '@/contexts/auto-collect-context'

export function FileUploadPlayback() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const eventsFileInputRef = useRef<HTMLInputElement>(null)
    const safeSpotsFileInputRef = useRef<HTMLInputElement>(null)
<<<<<<< HEAD
    
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
    const [eventsData, setEventsData] = useState<string>('')
    const [safeSpotsData, setSafeSpotsData] = useState<any[]>([])
    const [eventsFileName, setEventsFileName] = useState<string>('')
    const [safeSpotsFileName, setSafeSpotsFileName] = useState<string>('')
<<<<<<< HEAD
    
    const { 
        mode, 
        setMode, 
        setPlaybackData, 
        isPlaybackPlaying, 
        togglePlayback, 
        resetPlayback,
        playbackData,
        playbackIndex
=======

    const {
        mode,
        setMode,
        setPlaybackData,
        isPlaybackPlaying,
        togglePlayback,
        resetPlayback,
        playbackData,
        playbackIndex,
        playbackSpeed,
        setPlaybackSpeed
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
    } = useAutoCollect()

    const handleEventsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                setEventsData(content)
                setEventsFileName(file.name)
                console.log('Events file uploaded:', file.name)
<<<<<<< HEAD
                
                // Trigger custom event to update the events display
                window.dispatchEvent(new CustomEvent('eventsUploaded', { 
                    detail: { content, fileName: file.name } 
=======

                // Trigger custom event to update the events display
                window.dispatchEvent(new CustomEvent('eventsUploaded', {
                    detail: { content, fileName: file.name }
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                }))
            } catch (error) {
                console.error('Error reading events file:', error)
                alert('Error reading events file.')
            }
        }
        reader.readAsText(file)
    }

    const handleSafeSpotsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
<<<<<<< HEAD
                
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                // Parse the safe spots format from the TXT file
                const lines = content.split('\n').filter(line => line.trim())
                const spots: any[] = []
                const arena: any = {}
<<<<<<< HEAD
                
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                lines.forEach(line => {
                    if (line.includes('Corner') && line.includes('[')) {
                        const match = line.match(/Corner\d+:\s*\[([^\]]+)\]/)
                        if (match) {
                            const coords = match[1].split(',').map(n => parseFloat(n.trim()))
                            const cornerNum = line.match(/Corner(\d+)/)?.[1]
                            arena[`corner${cornerNum}`] = { lat: coords[0], lng: coords[1] }
                        }
                    } else if (line.includes('Spot') && line.includes('[')) {
                        const match = line.match(/Spot\d+:\s*\[([^\]]+)\]/)
                        if (match) {
                            const coords = match[1].split(',').map(n => parseFloat(n.trim()))
                            const spotNum = line.match(/Spot(\d+)/)?.[1]
                            spots.push({
                                id: `spot${spotNum}`,
                                lat: coords[0],
                                lng: coords[1]
                            })
                        }
                    }
                })
<<<<<<< HEAD
                
                setSafeSpotsData(spots)
                setSafeSpotsFileName(file.name)
                console.log('Safe spots uploaded:', spots.length, 'spots')
                
                // Trigger custom event to update safe spots visualization
                window.dispatchEvent(new CustomEvent('safeSpotsUploaded', { 
                    detail: { spots, arena, fileName: file.name } 
=======

                setSafeSpotsData(spots)
                setSafeSpotsFileName(file.name)
                console.log('Safe spots uploaded:', spots.length, 'spots')

                // Trigger custom event to update safe spots visualization
                window.dispatchEvent(new CustomEvent('safeSpotsUploaded', {
                    detail: { spots, arena, fileName: file.name }
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                }))
            } catch (error) {
                console.error('Error parsing safe spots file:', error)
                alert('Error parsing safe spots file.')
            }
        }
        reader.readAsText(file)
    }
<<<<<<< HEAD
=======

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const jsonData = JSON.parse(content)
<<<<<<< HEAD
                
                let dataArray: any[] = []
                
=======

                let dataArray: any[] = []

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                if (Array.isArray(jsonData)) {
                    dataArray = jsonData
                } else if (jsonData.data && Array.isArray(jsonData.data)) {
                    dataArray = jsonData.data
                } else {
                    dataArray = [jsonData]
                }

                setPlaybackData(dataArray)
                setMode('playback')
                resetPlayback()
<<<<<<< HEAD
                
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                console.log(`Loaded ${dataArray.length} data points for playback`)
            } catch (error) {
                console.error('Error parsing JSON file:', error)
                alert('Error parsing JSON file. Please check the file format.')
            }
        }
        reader.readAsText(file)
    }

    const handleEventsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                setEventsData(content)
                setEventsFileName(file.name)
                console.log('Events file loaded:', file.name)
            } catch (error) {
                console.error('Error reading events file:', error)
                alert('Error reading events file.')
            }
        }
        reader.readAsText(file)
    }

    const handleSafeSpotsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
<<<<<<< HEAD
                
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                // Try to parse as JSON first, then as text
                let spotsData: any[] = []
                try {
                    const jsonData = JSON.parse(content)
                    if (Array.isArray(jsonData)) {
                        spotsData = jsonData
                    } else if (jsonData.safeSpots && Array.isArray(jsonData.safeSpots)) {
                        spotsData = jsonData.safeSpots
                    }
                } catch {
                    // If JSON parsing fails, treat as text format
                    const lines = content.split('\n').filter(line => line.trim())
                    spotsData = lines.map((line, index) => {
                        const parts = line.split(',').map(p => p.trim())
                        return {
                            id: `spot_${index + 1}`,
                            name: parts[0] || `Safe Spot ${index + 1}`,
                            x: parseFloat(parts[1]) || 0,
                            y: parseFloat(parts[2]) || 0,
                            lat: parseFloat(parts[3]) || 0,
                            lng: parseFloat(parts[4]) || 0
                        }
                    })
                }
<<<<<<< HEAD
                
=======

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                setSafeSpotsData(spotsData)
                setSafeSpotsFileName(file.name)
                console.log('Safe spots file loaded:', file.name, spotsData)
            } catch (error) {
                console.error('Error reading safe spots file:', error)
                alert('Error reading safe spots file.')
            }
        }
        reader.readAsText(file)
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Playback Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Upload Buttons Row */}
                <div className="grid grid-cols-3 gap-2">
                    {/* JSON Telemetry Upload */}
                    <div className="space-y-2">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
<<<<<<< HEAD
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline" 
=======
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                            className="w-full"
                            size="sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload JSON
                        </Button>
                        {playbackData.length > 0 && (
                            <p className="text-xs text-gray-600 text-center">
                                {playbackData.length} points
                            </p>
                        )}
                    </div>

                    {/* Events File Upload */}
                    <div className="space-y-2">
                        <Input
                            ref={eventsFileInputRef}
                            type="file"
                            accept=".txt,.log"
                            onChange={handleEventsFileUpload}
                            className="hidden"
                        />
<<<<<<< HEAD
                        <Button 
                            onClick={() => eventsFileInputRef.current?.click()}
                            variant="outline" 
=======
                        <Button
                            onClick={() => eventsFileInputRef.current?.click()}
                            variant="outline"
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                            className="w-full"
                            size="sm"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Upload Events
                        </Button>
                        {eventsFileName && (
                            <p className="text-xs text-gray-600 text-center">
                                {eventsFileName}
                            </p>
                        )}
                    </div>

                    {/* Safe Spots Upload */}
                    <div className="space-y-2">
                        <Input
                            ref={safeSpotsFileInputRef}
                            type="file"
                            accept=".txt,.json"
                            onChange={handleSafeSpotsFileUpload}
                            className="hidden"
                        />
<<<<<<< HEAD
                        <Button 
                            onClick={() => safeSpotsFileInputRef.current?.click()}
                            variant="outline" 
=======
                        <Button
                            onClick={() => safeSpotsFileInputRef.current?.click()}
                            variant="outline"
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                            className="w-full"
                            size="sm"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Upload Safe Spots
                        </Button>
                        {safeSpotsFileName && (
                            <p className="text-xs text-gray-600 text-center">
                                {safeSpotsData.length} spots
                            </p>
                        )}
                    </div>
                </div>

                {/* Playback Controls */}
                {playbackData.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
<<<<<<< HEAD
                            <Button 
=======
                            <Button
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                                onClick={togglePlayback}
                                variant="default"
                                size="sm"
                                disabled={playbackData.length === 0}
                            >
                                {isPlaybackPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Play
                                    </>
                                )}
                            </Button>
<<<<<<< HEAD
                            <Button 
=======
                            <Button
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                                onClick={resetPlayback}
                                variant="outline"
                                size="sm"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
<<<<<<< HEAD
                        
=======

                        {/* Speed Controls */}
                        <div className="flex gap-1 items-center">
                            <span className="text-sm text-gray-600 mr-2">Speed:</span>
                            <Button
                                onClick={() => {
                                    setPlaybackSpeed(1)
                                    // Restart playback if currently playing to apply new speed
                                    if (isPlaybackPlaying) {
                                        togglePlayback()
                                        setTimeout(() => togglePlayback(), 100)
                                    }
                                }}
                                variant={playbackSpeed === 1 ? "default" : "outline"}
                                size="sm"
                                className="px-3"
                            >
                                1x
                            </Button>
                            <Button
                                onClick={() => {
                                    setPlaybackSpeed(2)
                                    // Restart playback if currently playing to apply new speed
                                    if (isPlaybackPlaying) {
                                        togglePlayback()
                                        setTimeout(() => togglePlayback(), 100)
                                    }
                                }}
                                variant={playbackSpeed === 2 ? "default" : "outline"}
                                size="sm"
                                className="px-3"
                            >
                                2x
                            </Button>
                            <Button
                                onClick={() => {
                                    setPlaybackSpeed(3)
                                    // Restart playback if currently playing to apply new speed
                                    if (isPlaybackPlaying) {
                                        togglePlayback()
                                        setTimeout(() => togglePlayback(), 100)
                                    }
                                }}
                                variant={playbackSpeed === 3 ? "default" : "outline"}
                                size="sm"
                                className="px-3"
                            >
                                3x
                            </Button>
                        </div>

>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                        {/* Progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progress: {playbackIndex + 1} / {playbackData.length}</span>
                                <span>
                                    {Math.round(((playbackIndex + 1) / playbackData.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
<<<<<<< HEAD
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${((playbackIndex + 1) / playbackData.length) * 100}%` 
=======
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${((playbackIndex + 1) / playbackData.length) * 100}%`
>>>>>>> 9f05768cbbf1ce5ba17f048713bda4e399c9a4ec
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Display */}
                {eventsData && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Events Sequence:</h4>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm font-mono">
                            <pre className="whitespace-pre-wrap text-gray-800">
                                {eventsData}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Safe Spots Display */}
                {safeSpotsData.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Safe Spots:</h4>
                        <div className="max-h-24 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                            {safeSpotsData.map((spot, index) => (
                                <div key={index} className="text-gray-700">
                                    {spot.name || `Spot ${index + 1}`}: ({spot.x?.toFixed(2)}, {spot.y?.toFixed(2)})
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
