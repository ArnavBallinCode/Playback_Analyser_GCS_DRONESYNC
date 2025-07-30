"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { setTelemetryPlaybackMode, setTelemetryPlaybackData, setTelemetryPlaybackIndex, triggerTelemetryRefresh } from '@/app/hooks/useTelemetryData'

interface AutoCollectContextType {
    autoCollect: boolean
    collecting: boolean
    graphData: any[]
    mode: 'live' | 'playback'
    playbackData: any[]
    isPlaybackPlaying: boolean
    playbackIndex: number
    playbackSpeed: number
    toggleAutoCollect: () => void
    refreshData: () => void
    setMode: (mode: 'live' | 'playback') => void
    setPlaybackData: (data: any[]) => void
    togglePlayback: () => void
    resetPlayback: () => void
    setPlaybackSpeed: (speed: number) => void
}

const AutoCollectContext = createContext<AutoCollectContextType | undefined>(undefined)

export function AutoCollectProvider({ children }: { children: React.ReactNode }) {
    const [autoCollect, setAutoCollect] = useState(false)
    const [collecting, setCollecting] = useState(false)
    const [graphData, setGraphData] = useState<any[]>([])
    const [mode, setMode] = useState<'live' | 'playback'>('playback')
    const [playbackData, setPlaybackData] = useState<any[]>([])
    const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false)
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const [playbackSpeed, setPlaybackSpeed] = useState(1) // 1x, 2x, 3x speed
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch graph data
    const fetchGraphData = async () => {
        if (mode === 'playback') {
            // In playback mode, use the uploaded data
            setGraphData(playbackData.slice(0, playbackIndex + 1))
            return
        }

        try {
            const response = await fetch('/api/history-data?days=1', { cache: 'no-store' })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const result = await response.json()
            if (result.status === 'success') {
                setGraphData(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching graph data:', error)
        }
    }    // Collect current data and update graph
    const collectCurrentData = async () => {
        setCollecting(true)
        try {
            const response = await fetch('/api/history-data?action=collect', {
                method: 'GET',
                cache: 'no-store'
            })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const result = await response.json()
            if (result.status === 'success') {
                await fetchGraphData()
            }
        } catch (error) {
            console.error('Error collecting data:', error)
        } finally {
            setCollecting(false)
        }
    }

    // Toggle auto-collect - Disabled for playback-only mode
    const toggleAutoCollect = async () => {
        // Auto-collect disabled - only playback mode supported
        console.log('Auto-collect disabled - use playback mode instead')
    }

    // Refresh data manually
    const refreshData = () => {
        fetchGraphData()
    }

    // Playback control functions - simplified without API
    const togglePlayback = () => {
        if (playbackData.length === 0) return

        if (isPlaybackPlaying) {
            // Pause playback
            if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current)
                playbackIntervalRef.current = null
            }
            setIsPlaybackPlaying(false)
        } else {
            // Start playback
            setIsPlaybackPlaying(true)
            playbackIntervalRef.current = setInterval(() => {
                setPlaybackIndex(prevIndex => {
                    const nextIndex = prevIndex + 1
                    if (nextIndex >= playbackData.length) {
                        // End of playback
                        if (playbackIntervalRef.current) {
                            clearInterval(playbackIntervalRef.current)
                            playbackIntervalRef.current = null
                        }
                        setIsPlaybackPlaying(false)
                        return prevIndex
                    }

                    // Update telemetry with new index
                    setTelemetryPlaybackIndex(nextIndex)
                    triggerTelemetryRefresh()

                    console.log(`Playback step: ${nextIndex}/${playbackData.length}`)

                    return nextIndex
                })
            }, 1000 / playbackSpeed) // Adjust interval based on speed (1x = 1000ms, 2x = 500ms, 3x = 333ms)
        }
    }

    const resetPlayback = () => {
        if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current)
            playbackIntervalRef.current = null
        }
        setIsPlaybackPlaying(false)
        setPlaybackIndex(0)
        setTelemetryPlaybackIndex(0)
        triggerTelemetryRefresh()
        setGraphData([])
    }

    // Update setMode and setPlaybackData to sync with telemetry - simplified
    const updateMode = (newMode: 'live' | 'playback') => {
        setMode(newMode)
        setTelemetryPlaybackMode(newMode)
        triggerTelemetryRefresh()
    }

    const updatePlaybackData = (data: any[]) => {
        setPlaybackData(data)
        setTelemetryPlaybackData(data)
        triggerTelemetryRefresh()
    }

    // Update graph data when playback index changes
    useEffect(() => {
        if (mode === 'playback' && playbackData.length > 0) {
            fetchGraphData()
        }
    }, [playbackIndex, mode, playbackData])

    // Initial fetch and cleanup
    useEffect(() => {
        fetchGraphData()
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current)
                playbackIntervalRef.current = null
            }
        }
    }, [])

    return (
        <AutoCollectContext.Provider value={{
            autoCollect,
            collecting,
            graphData,
            mode,
            playbackData,
            isPlaybackPlaying,
            playbackIndex,
            playbackSpeed,
            toggleAutoCollect,
            refreshData,
            setMode: updateMode,
            setPlaybackData: updatePlaybackData,
            togglePlayback,
            resetPlayback,
            setPlaybackSpeed
        }}>
            {children}
        </AutoCollectContext.Provider>
    )
}

export function useAutoCollect() {
    const context = useContext(AutoCollectContext)
    if (context === undefined) {
        throw new Error('useAutoCollect must be used within an AutoCollectProvider')
    }
    return context
}
