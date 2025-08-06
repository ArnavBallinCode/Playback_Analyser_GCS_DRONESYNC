"use client"

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Play, Pause, Square, Upload, FileText, MapPin, Activity, Gauge } from 'lucide-react'
import { useAutoCollect } from '@/contexts/auto-collect-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function FileUploadPlayback() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const eventsFileInputRef = useRef<HTMLInputElement>(null)
    const safeSpotsFileInputRef = useRef<HTMLInputElement>(null)
    
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
    } = useAutoCollect()

    // Handle JSON telemetry file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const jsonData = JSON.parse(content)
                
                let dataArray: any[] = []
                
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
                
                console.log(`Loaded ${dataArray.length} data points for playback`)
                console.log('First data point:', dataArray[0])
            } catch (error) {
                console.error('Error parsing JSON file:', error)
                alert('Error parsing JSON file. Please check the file format.')
            }
        }
        reader.readAsText(file)
    }

    // Handle events TXT file upload
    const handleEventsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                console.log('Events file uploaded:', file.name)
                
                // Trigger custom event to update the events display
                window.dispatchEvent(new CustomEvent('eventsUploaded', { 
                    detail: { content, fileName: file.name } 
                }))
            } catch (error) {
                console.error('Error reading events file:', error)
                alert('Error reading events file.')
            }
        }
        reader.readAsText(file)
    }

    // Handle safe spots TXT file upload
    const handleSafeSpotsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                
                // Parse the safe spots format from the TXT file
                const lines = content.split('\n').filter(line => line.trim())
                const spots: any[] = []
                const arena: any = {}
                
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
                
                console.log('Safe spots uploaded:', spots.length, 'spots')
                
                // Trigger custom event to update safe spots visualization
                window.dispatchEvent(new CustomEvent('safeSpotsUploaded', { 
                    detail: { spots, arena, fileName: file.name } 
                }))
            } catch (error) {
                console.error('Error parsing safe spots file:', error)
                alert('Error parsing safe spots file.')
            }
        }
        reader.readAsText(file)
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleEventsUploadClick = () => {
        eventsFileInputRef.current?.click()
    }

    const handleSafeSpotsUploadClick = () => {
        safeSpotsFileInputRef.current?.click()
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    File Upload & Playback Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Upload Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    {/* JSON Telemetry */}
                    <div>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button 
                            onClick={handleUploadClick}
                            variant="outline" 
                            className="w-full"
                            size="sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            JSON Telemetry
                        </Button>
                    </div>

                    {/* Events TXT */}
                    <div>
                        <Input
                            ref={eventsFileInputRef}
                            type="file"
                            accept=".txt"
                            onChange={handleEventsUpload}
                            className="hidden"
                        />
                        <Button 
                            onClick={handleEventsUploadClick}
                            variant="outline" 
                            className="w-full"
                            size="sm"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Events TXT
                        </Button>
                    </div>

                    {/* Safe Spots TXT */}
                    <div>
                        <Input
                            ref={safeSpotsFileInputRef}
                            type="file"
                            accept=".txt"
                            onChange={handleSafeSpotsUpload}
                            className="hidden"
                        />
                        <Button 
                            onClick={handleSafeSpotsUploadClick}
                            variant="outline" 
                            className="w-full"
                            size="sm"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Safe Spots TXT
                        </Button>
                    </div>
                </div>

                {/* Status */}
                {playbackData.length > 0 && (
                    <p className="text-sm text-gray-600">
                        Loaded: {playbackData.length} data points
                    </p>
                )}

                {/* Playback Controls */}
                {playbackData.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Button 
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
                            <Button 
                                onClick={resetPlayback}
                                variant="outline"
                                size="sm"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            
                            {/* Playback Speed Dropdown */}
                            <Select 
                                value={playbackSpeed.toString()} 
                                onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}
                            >
                                <SelectTrigger className="w-20 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.25">0.25x</SelectItem>
                                    <SelectItem value="0.5">0.5x</SelectItem>
                                    <SelectItem value="1">1x</SelectItem>
                                    <SelectItem value="2">2x</SelectItem>
                                    <SelectItem value="3">3x</SelectItem>
                                    <SelectItem value="4">4x</SelectItem>
                                    <SelectItem value="5">5x</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progress: {playbackIndex + 1} / {playbackData.length}</span>
                                <span>
                                    {Math.round(((playbackIndex + 1) / playbackData.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${((playbackIndex + 1) / playbackData.length) * 100}%` 
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
