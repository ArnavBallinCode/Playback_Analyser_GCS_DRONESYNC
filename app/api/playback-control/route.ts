import { NextResponse } from 'next/server'

// Simple in-memory playback state
let playbackState = {
  mode: 'live' as 'live' | 'playback',
  data: [] as any[],
  currentIndex: 0,
  isPlaying: false
}

export async function GET() {
  return NextResponse.json({
    status: 'success',
    ...playbackState
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data, index } = body

    switch (action) {
      case 'setMode':
        playbackState.mode = body.mode
        break
        
      case 'setData':
        playbackState.data = data || []
        playbackState.currentIndex = 0
        playbackState.isPlaying = false
        break

      case 'setIndex':
        if (typeof index === 'number' && index >= 0 && index < playbackState.data.length) {
          playbackState.currentIndex = index
        }
        break

      case 'play':
        playbackState.isPlaying = true
        break

      case 'pause':
        playbackState.isPlaying = false
        break

      case 'reset':
        playbackState.currentIndex = 0
        playbackState.isPlaying = false
        break

      case 'step':
        if (playbackState.currentIndex < playbackState.data.length - 1) {
          playbackState.currentIndex++
        } else {
          playbackState.isPlaying = false
        }
        break

      default:
        return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({
      status: 'success',
      ...playbackState
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
