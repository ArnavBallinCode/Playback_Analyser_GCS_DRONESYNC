import { useState, useEffect, useRef } from 'react'
import { useAutoCollect } from '@/contexts/auto-collect-context'

export interface TelemetryData {
  attitude?: {
    roll: number
    pitch: number
    yaw: number
    rollspeed: number
    pitchspeed: number
    yawspeed: number
    time_boot_ms: number
  }
  battery?: {
    voltage_battery: number
    current_battery: number
    battery_remaining: number
    time_remaining: number
    energy_consumed: number
    voltages: number[]
  }
  heartbeat?: {
    type: number
    autopilot: number
    base_mode: number
    custom_mode: number
    system_status: number
  }
  scaled_imu2?: {
    time_boot_ms: number
    xacc: number
    yacc: number
    zacc: number
    xgyro: number
    ygyro: number
    zgyro: number
    xmag: number
    ymag: number
    zmag: number
    temperature: number
  }
  global_position_int?: {
    time_boot_ms: number
    lat: number
    lon: number
    alt: number
    relative_alt: number
    vx: number
    vy: number
    vz: number
    hdg: number
  }
  local_position_ned?: {
    time_boot_ms: number
    x: number
    y: number
    z: number
    vx: number
    vy: number
    vz: number
  }
  // Add these for dashboard compatibility
  local_position?: {
    time_boot_ms: number
    x: number
    y: number
    z: number
    vx: number
    vy: number
    vz: number
  }
  system_health?: {
    cpu_load: number
    memory_usage: number
  }
  ahrs?: {
    omegaIx: number
    omegaIy: number
    omegaIz: number
  }
  rc_channels?: {
    time_boot_ms: number
    chancount: number
    chan1_raw: number
    chan2_raw: number
    chan3_raw: number
    chan4_raw: number
    chan5_raw: number
    chan6_raw: number
    chan7_raw: number
    chan8_raw: number
    chan9_raw: number
    chan10_raw: number
    chan11_raw: number
    chan12_raw: number
    rssi: number
  }
  radio_status?: {
    rssi: number
    remrssi: number
    txbuf: number
    noise: number
    remnoise: number
    rxerrors: number
    fixed: number
    packet_loss: number
  }
}

// Legacy functions for backward compatibility (now handled by auto-collect context)
export function setTelemetryPlaybackMode(mode: 'live' | 'playback') {
  // Mode is now controlled by auto-collect context
}

export function setTelemetryPlaybackData(data: any[]) {
  // Data is now controlled by auto-collect context
}

export function setTelemetryPlaybackIndex(index: number) {
  // Index is now controlled by auto-collect context
}

export function triggerTelemetryRefresh() {
  // Refresh is now handled by auto-collect context
}

export function useTelemetryData() {
  const [data, setData] = useState<TelemetryData>({})
  const [isConnected, setIsConnected] = useState(false)

  // Use auto-collect context for playback data
  const { mode, playbackData, playbackIndex } = useAutoCollect()

  useEffect(() => {
    // Check if we're in playback mode
    if (mode === 'playback') {
      if (playbackData.length > 0 && playbackIndex < playbackData.length) {
        const currentPlaybackData = playbackData[playbackIndex]
        
        // Map playback data to telemetry format
        const mappedData: TelemetryData = {
          attitude: currentPlaybackData.attitude || currentPlaybackData.ATTITUDE,
          battery: currentPlaybackData.battery ? {
            voltage_battery: currentPlaybackData.battery.voltage || 0,
            current_battery: currentPlaybackData.battery.current || 0,
            battery_remaining: currentPlaybackData.battery.remaining || 0,
            time_remaining: currentPlaybackData.battery.time_remaining || 0,
            energy_consumed: currentPlaybackData.battery.energy_consumed || 0,
            voltages: currentPlaybackData.battery.voltages || [currentPlaybackData.battery.voltage || 0]
          } : undefined,
          heartbeat: currentPlaybackData.heartbeat || currentPlaybackData.HEARTBEAT,
          scaled_imu2: currentPlaybackData.imu ? {
            time_boot_ms: currentPlaybackData.time_boot_ms || 0,
            xacc: currentPlaybackData.imu.xacc || 0,
            yacc: currentPlaybackData.imu.yacc || 0,
            zacc: currentPlaybackData.imu.zacc || 0,
            xgyro: currentPlaybackData.imu.xgyro || 0,
            ygyro: currentPlaybackData.imu.ygyro || 0,
            zgyro: currentPlaybackData.imu.zgyro || 0,
            xmag: currentPlaybackData.imu.xmag || 0,
            ymag: currentPlaybackData.imu.ymag || 0,
            zmag: currentPlaybackData.imu.zmag || 0,
            temperature: 0
          } : currentPlaybackData.scaled_imu2 || currentPlaybackData.SCALED_IMU2,
          global_position_int: currentPlaybackData.position ? {
            time_boot_ms: currentPlaybackData.time_boot_ms || 0,
            lat: currentPlaybackData.position.lat || 0,
            lon: currentPlaybackData.position.lon || 0,
            alt: currentPlaybackData.position.alt || 0,
            relative_alt: currentPlaybackData.position.relative_alt || 0,
            vx: currentPlaybackData.velocity?.vx || 0,
            vy: currentPlaybackData.velocity?.vy || 0,
            vz: currentPlaybackData.velocity?.vz || 0,
            hdg: 0
          } : currentPlaybackData.global_position_int || currentPlaybackData.GLOBAL_POSITION_INT,
          local_position_ned: currentPlaybackData.position && currentPlaybackData.velocity ? {
            time_boot_ms: currentPlaybackData.time_boot_ms || 0,
            x: currentPlaybackData.position.x || 0,
            y: currentPlaybackData.position.y || 0,
            z: currentPlaybackData.position.z || 0,
            vx: currentPlaybackData.velocity.vx || 0,
            vy: currentPlaybackData.velocity.vy || 0,
            vz: currentPlaybackData.velocity.vz || 0
          } : currentPlaybackData.local_position_ned || currentPlaybackData.LOCAL_POSITION_NED,
          // Add local_position alias for dashboard compatibility
          local_position: currentPlaybackData.position && currentPlaybackData.velocity ? {
            time_boot_ms: currentPlaybackData.time_boot_ms || 0,
            x: currentPlaybackData.position.x || 0,
            y: currentPlaybackData.position.y || 0,
            z: currentPlaybackData.position.z || 0,
            vx: currentPlaybackData.velocity.vx || 0,
            vy: currentPlaybackData.velocity.vy || 0,
            vz: currentPlaybackData.velocity.vz || 0
          } : currentPlaybackData.local_position,
          // Add system health data (reasonable static values since not in JSON)
          system_health: {
            cpu_load: 45, // Static reasonable CPU load
            memory_usage: 62 // Static reasonable memory usage
          },
          // Add AHRS data derived from attitude angular velocities
          ahrs: currentPlaybackData.attitude ? {
            omegaIx: currentPlaybackData.attitude.rollspeed || 0,
            omegaIy: currentPlaybackData.attitude.pitchspeed || 0,
            omegaIz: currentPlaybackData.attitude.yawspeed || 0
          } : undefined,
          rc_channels: currentPlaybackData.rc_channels || currentPlaybackData.RC_CHANNELS,
          radio_status: currentPlaybackData.radio_status || currentPlaybackData.RADIO_STATUS
        }

        setData(mappedData)
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } else {
      // Live mode is disabled - only playback mode is supported
      setIsConnected(false)
    }
  }, [mode, playbackData, playbackIndex])

  return { data, isConnected }
}
