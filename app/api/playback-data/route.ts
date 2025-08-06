import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const PARAMS_DIR = join(process.cwd(), 'public', 'params')

// Ensure params directory exists
if (!existsSync(PARAMS_DIR)) {
  mkdirSync(PARAMS_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const dataPoint = await request.json()
    
    if (!dataPoint) {
      return NextResponse.json({
        status: 'error',
        message: 'No data provided'
      }, { status: 400 })
    }

    // Simulate the data files that would be created by listen.py
    
    // Write BATTERY_STATUS.json
    if (dataPoint.battery) {
      const batteryData = {
        voltages: [dataPoint.battery.voltage || 0],
        current_battery: dataPoint.battery.current || 0,
        battery_remaining: dataPoint.battery.remaining || 0,
        temperature: dataPoint.battery.temperature || 0,
        time_boot_ms: dataPoint.time_boot_ms || Date.now()
      }
      writeFileSync(
        join(PARAMS_DIR, 'BATTERY_STATUS.json'),
        JSON.stringify(batteryData, null, 2)
      )
    }

    // Write LOCAL_POSITION_NED.json
    if (dataPoint.position || dataPoint.velocity) {
      const localPosData = {
        time_boot_ms: dataPoint.time_boot_ms || Date.now(),
        x: dataPoint.position?.x || 0,
        y: dataPoint.position?.y || 0,
        z: dataPoint.position?.z || 0,
        vx: dataPoint.velocity?.vx || 0,
        vy: dataPoint.velocity?.vy || 0,
        vz: dataPoint.velocity?.vz || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'LOCAL_POSITION_NED.json'),
        JSON.stringify(localPosData, null, 2)
      )
    }

    // Write GLOBAL_POSITION_INT.json
    if (dataPoint.position) {
      const globalPosData = {
        time_boot_ms: dataPoint.time_boot_ms || Date.now(),
        lat: dataPoint.position.lat || 0,
        lon: dataPoint.position.lon || 0,
        alt: dataPoint.position.alt || 0,
        relative_alt: dataPoint.position.relative_alt || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'GLOBAL_POSITION_INT.json'),
        JSON.stringify(globalPosData, null, 2)
      )
    }

    // Write ATTITUDE.json
    if (dataPoint.attitude) {
      const attitudeData = {
        time_boot_ms: dataPoint.time_boot_ms || Date.now(),
        roll: dataPoint.attitude.roll || 0,
        pitch: dataPoint.attitude.pitch || 0,
        yaw: dataPoint.attitude.yaw || 0,
        rollspeed: dataPoint.attitude.rollspeed || 0,
        pitchspeed: dataPoint.attitude.pitchspeed || 0,
        yawspeed: dataPoint.attitude.yawspeed || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'ATTITUDE.json'),
        JSON.stringify(attitudeData, null, 2)
      )
    }

    // Write RAW_IMU.json
    if (dataPoint.imu) {
      const imuData = {
        time_boot_ms: dataPoint.time_boot_ms || Date.now(),
        xacc: dataPoint.imu.xacc || 0,
        yacc: dataPoint.imu.yacc || 0,
        zacc: dataPoint.imu.zacc || 0,
        xgyro: dataPoint.imu.xgyro || 0,
        ygyro: dataPoint.imu.ygyro || 0,
        zgyro: dataPoint.imu.zgyro || 0,
        xmag: dataPoint.imu.xmag || 0,
        ymag: dataPoint.imu.ymag || 0,
        zmag: dataPoint.imu.zmag || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'RAW_IMU.json'),
        JSON.stringify(imuData, null, 2)
      )
    }

    // Write RANGEFINDER.json or DISTANCE_SENSOR.json
    if (dataPoint.rangefinder) {
      const rangefinderData = {
        time_boot_ms: dataPoint.time_boot_ms || Date.now(),
        distance: dataPoint.rangefinder.distance || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'RANGEFINDER.json'),
        JSON.stringify(rangefinderData, null, 2)
      )
      writeFileSync(
        join(PARAMS_DIR, 'DISTANCE_SENSOR.json'),
        JSON.stringify(rangefinderData, null, 2)
      )
    }

    // Write HEARTBEAT.json
    if (dataPoint.heartbeat) {
      const heartbeatData = {
        system_status: dataPoint.heartbeat.system_status || 0,
        base_mode: dataPoint.heartbeat.base_mode || 0,
        custom_mode: dataPoint.heartbeat.custom_mode || 0
      }
      writeFileSync(
        join(PARAMS_DIR, 'HEARTBEAT.json'),
        JSON.stringify(heartbeatData, null, 2)
      )
    }

    // Write SYS_STATUS.json with basic system info
    const sysStatusData = {
      time_boot_ms: dataPoint.time_boot_ms || Date.now(),
      voltage_battery: (dataPoint.battery?.voltage || 0) * 1000, // Convert to mV
      current_battery: (dataPoint.battery?.current || 0) * 100, // Convert to cA
      battery_remaining: dataPoint.battery?.remaining || 0
    }
    writeFileSync(
      join(PARAMS_DIR, 'SYS_STATUS.json'),
      JSON.stringify(sysStatusData, null, 2)
    )

    return NextResponse.json({
      status: 'success',
      message: 'Playback data written successfully'
    })

  } catch (error) {
    console.error('Error processing playback data:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to process playback data'
    }, { status: 500 })
  }
}
