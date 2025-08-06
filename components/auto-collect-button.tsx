"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Play } from "lucide-react"
import { useAutoCollect } from "@/contexts/auto-collect-context"

export function AutoCollectButton() {
    const { mode, playbackData, isPlaybackPlaying, playbackIndex } = useAutoCollect()

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <Badge variant={mode === 'playback' ? 'default' : 'secondary'} className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {mode === 'playback' ? 'Playback Mode' : 'Live Mode'}
                </Badge>
                
                {mode === 'playback' && playbackData.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`h-2 w-2 rounded-full ${isPlaybackPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span>
                            {isPlaybackPlaying ? 'Playing' : 'Paused'} • 
                            {playbackIndex + 1} of {playbackData.length}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
