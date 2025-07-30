"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useAutoCollect } from "@/contexts/auto-collect-context"

interface ZvsTimeChartProps {
  data?: any[];
}

export default function ZvsTimeChart({ data }: ZvsTimeChartProps) {
  const [graphData, setGraphData] = useState<number[]>(new Array(600).fill(0)); // 600 points for 10 minutes
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentZ, setCurrentZ] = useState(0);
  const { mode, playbackData, playbackIndex, isPlaybackPlaying } = useAutoCollect();

  // Fetch Z position data - from playback or default
  const fetchZPosition = async () => {
    if (mode === 'playback' && playbackData.length > 0 && playbackIndex < playbackData.length) {
      const currentData = playbackData[playbackIndex]
      
      if (currentData) {
        let height = 0
        
        // Try different data structures for Z position
        if (currentData.position && typeof currentData.position.z === 'number') {
          // Z is stored as negative in NED coordinates, convert to positive altitude
          height = Math.abs(currentData.position.z)
        } else if (currentData.position && typeof currentData.position.relative_alt === 'number') {
          // Use relative altitude in millimeters, convert to meters
          height = currentData.position.relative_alt / 1000
        } else if (currentData.LOCAL_POSITION_NED && typeof currentData.LOCAL_POSITION_NED.z === 'number') {
          const rawZ = currentData.LOCAL_POSITION_NED.z
          height = Math.abs(rawZ) // Convert to positive height
        } else if (currentData.z !== undefined) {
          height = Math.abs(currentData.z)
        } else if (currentData.altitude !== undefined) {
          height = Math.abs(currentData.altitude)
        }
        
        console.log('Z Position Debug:', {
          playbackIndex,
          rawData: currentData.position,
          calculatedHeight: height
        })
        
        // Clamp height to reasonable range (0-10 meters for drone)
        return Math.max(0, Math.min(10, height))
      }
    }
    
    return 0 // Return 0 if no playback data
  }

  // Update graph when playback data changes
  useEffect(() => {
    if (mode === 'playback' && playbackData.length > 0) {
      setIsActive(isPlaybackPlaying); // Set active based on playback state
      
      const updateGraph = async () => {
        const newZ = await fetchZPosition();
        setCurrentZ(newZ);

        // Use playbackIndex from context instead of local currentIndex
        setGraphData(prevData => {
          const newData = [...prevData];
          newData[playbackIndex % 600] = newZ; // Use playbackIndex
          return newData;
        });

        setCurrentIndex(playbackIndex % 600); // Sync local index with playback
      };
      
      updateGraph();
    } else if (mode !== 'playback') {
      setIsActive(false);
      // Reset graph when not in playback mode
      setGraphData(new Array(600).fill(0));
      setCurrentIndex(0);
      setCurrentZ(0);
    }
  }, [mode, playbackData, playbackIndex, isPlaybackPlaying]); // Add isPlaybackPlaying as dependency

  // Simple SVG chart - 10 minutes of real-time data
  const renderChart = () => {
    const width = 1200;  // Much wider for 10 minutes
    const height = 280;  // Taller for better visibility
    const padding = 40;  // Less left padding, more space for graph
    const chartWidth = width - padding - 20; // Less right padding too
    const chartHeight = height - 2 * padding;

    // Create path points for smooth ECG-style movement (600 points = 10 minutes)
    const points = graphData.map((z, index) => {
      const x = padding + (index / 599) * chartWidth; // 599 to get full width
      // Map 0-10m range to chart height (0m at bottom, 10m at top)
      const y = padding + chartHeight - (z / 10) * chartHeight;
      return { x, y, isActive: index === currentIndex };
    });

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="border-none rounded-lg bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <defs>
          {/* Enhanced gradient for professional line */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#2563eb" stopOpacity="1" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="75%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.95" />
          </linearGradient>

          {/* Subtle glow effect */}
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Current position glow */}
          <filter id="currentGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines - 10 minute intervals */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(minute => (
          <g key={minute}>
            <line
              x1={padding + (minute / 10) * chartWidth}
              y1={padding}
              x2={padding + (minute / 10) * chartWidth}
              y2={height - padding}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.6"
            />
            <text
              x={padding + (minute / 10) * chartWidth}
              y={height - 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
              fontWeight="500"
            >
              {minute}min
            </text>
          </g>
        ))}

        {/* Y-axis labels - Height markers */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(meter => (
          <g key={meter}>
            <line
              x1={padding}
              y1={padding + chartHeight - (meter / 10) * chartHeight}
              x2={width - padding}
              y2={padding + chartHeight - (meter / 10) * chartHeight}
              stroke="#f3f4f6"
              strokeWidth="1"
              opacity="0.5"
            />
            <text
              x={25}
              y={padding + chartHeight - (meter / 10) * chartHeight + 4}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
              fontWeight="500"
            >
              {meter}m
            </text>
          </g>
        ))}

        {/* Enhanced smooth line path - always show data (don't hide on abort) */}
        {graphData.some(value => value !== 0) && (
          <path
            d={(() => {
              const validPoints = points
                .map((point, index) => ({ ...point, value: graphData[index] }))
                .filter((point, index) => point.value !== 0);

              if (validPoints.length === 0) return '';
              if (validPoints.length === 1) return `M ${validPoints[0].x},${validPoints[0].y}`;

              // Simple line path for better visibility
              const pathCommands = validPoints.map((point, index) =>
                `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
              );

              return pathCommands.join(' ');
            })()}
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
            style={{
              transition: 'all 0.1s ease-out'
            }}
          />
        )}

        {/* Enhanced current position indicator - show when there's data */}
        {currentZ > 0 && currentIndex > 0 && (
          <>
            {/* Outer glow ring */}
            <circle
              cx={points[currentIndex - 1]?.x || 0}
              cy={points[currentIndex - 1]?.y || 0}
              r="8"
              fill="none"
              stroke={isPlaybackPlaying ? "#3b82f6" : "#94a3b8"}
              strokeWidth="1"
              opacity={isPlaybackPlaying ? "0.4" : "0.3"}
              filter="url(#currentGlow)"
            />
            {/* Main position dot */}
            <circle
              cx={points[currentIndex - 1]?.x || 0}
              cy={points[currentIndex - 1]?.y || 0}
              r="4"
              fill={isPlaybackPlaying ? "#1e40af" : "#64748b"}
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))',
                transition: 'all 0.2s ease-out'
              }}
            />
          </>
        )}

        {/* Chart title and current value */}
        <text
          x={width / 2}
          y={25}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="600"
        >
          Altitude in meters 
        </text>

        {/* Current Z value display with enhanced styling */}
        <text
          x={width - 80}
          y={45}
          textAnchor="middle"
          fontSize="12"
          fill="#1e40af"
          fontWeight="700"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(30, 64, 175, 0.3))' }}
        >
          {currentZ.toFixed(3)}m
        </text>
      </svg>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="py-2 px-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="w-5 h-5" />
            Z Monitor - {mode === 'playback' 
              ? (isPlaybackPlaying ? `Playing (${currentZ.toFixed(3)}m)` : 'Playback Paused')
              : 'Upload JSON file for playback'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-1 flex flex-col" style={{ minHeight: '350px' }}>
          <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
