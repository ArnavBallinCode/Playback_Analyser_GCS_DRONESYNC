// Simple in-memory store for playback state
interface PlaybackState {
  mode: 'live' | 'playback'
  data: any[]
  currentIndex: number
  isPlaying: boolean
}

let playbackState: PlaybackState = {
  mode: 'live',
  data: [],
  currentIndex: 0,
  isPlaying: false
}

export function setPlaybackMode(mode: 'live' | 'playback') {
  playbackState.mode = mode
}

export function setPlaybackData(data: any[]) {
  playbackState.data = data
  playbackState.currentIndex = 0
  playbackState.isPlaying = false
}

export function getPlaybackState() {
  return { ...playbackState }
}

export function setPlaybackIndex(index: number) {
  if (index >= 0 && index < playbackState.data.length) {
    playbackState.currentIndex = index
  }
}

export function togglePlayback() {
  playbackState.isPlaying = !playbackState.isPlaying
}

export function resetPlayback() {
  playbackState.currentIndex = 0
  playbackState.isPlaying = false
}

export function getCurrentPlaybackData() {
  if (playbackState.mode === 'playback' && playbackState.data.length > 0) {
    return playbackState.data[playbackState.currentIndex] || null
  }
  return null
}
