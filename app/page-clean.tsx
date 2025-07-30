"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardParameters } from "@/components/dashbard-parameters"
import DashboardSafeSpot from "@/components/dashboard-safespot"
import ZvsTimeChart from "@/components/dashboard-z_vs_t-graph"
import { AutoCollectButton } from "@/components/auto-collect-button"
import { FileUploadPlayback } from "@/components/file-upload-playback"
import { useAutoCollect } from "@/contexts/auto-collect-context"


export default function DashboardPage() {
  const { graphData } = useAutoCollect()

  // Events Component - Shows events from uploaded TXT files
  const JetsonEventsBox = React.memo(() => {
    const [events, setEvents] = React.useState('Events Sequence: Upload events.txt file using buttons above');
    const { mode, playbackData, playbackIndex } = useAutoCollect();

    // Listen for events upload from the upload component
    React.useEffect(() => {
      const handleEventsUpload = (event: any) => {
        const { content, fileName } = event.detail;
        setEvents(`Events from ${fileName}:\n\n${content}`);
      };

      const handleSafeSpotsUpload = (event: any) => {
        const { spots, arena, fileName } = event.detail;
        let safeSpotText = `Safe Spots from ${fileName}:\n\n`;
        safeSpotText += `Arena Corners:\n`;
        Object.entries(arena).forEach(([key, value]: [string, any]) => {
          safeSpotText += `${key}: [${value.lat}, ${value.lng}]\n`;
        });
        safeSpotText += `\nSafe Spots (${spots.length}):\n`;
        spots.forEach((spot: any, index: number) => {
          safeSpotText += `${spot.id}: [${spot.lat}, ${spot.lng}]\n`;
        });
        
        // Show safe spots info in events display
        setEvents(prev => prev.includes('Events from') ? prev + '\n\n' + safeSpotText : safeSpotText);
      };

      window.addEventListener('eventsUploaded', handleEventsUpload);
      window.addEventListener('safeSpotsUploaded', handleSafeSpotsUpload);

      return () => {
        window.removeEventListener('eventsUploaded', handleEventsUpload);
        window.removeEventListener('safeSpotsUploaded', handleSafeSpotsUpload);
      };
    }, []);

    // Show telemetry data during playback if no uploaded events
    React.useEffect(() => {
      if (mode === 'playback' && playbackData.length > 0) {
        if (playbackIndex < playbackData.length) {
          const currentData = playbackData[playbackIndex];
          
          let eventText = `Telemetry Data Point ${playbackIndex + 1}/${playbackData.length}\n\n`;
          
          if (currentData.timestamp) {
            eventText += `Time: ${currentData.timestamp}\n`;
          }
          
          if (currentData.position) {
            eventText += `Position: X=${currentData.position.x.toFixed(2)}, Y=${currentData.position.y.toFixed(2)}, Z=${currentData.position.z.toFixed(2)}\n`;
          }
          
          if (currentData.battery) {
            eventText += `Battery: ${(currentData.battery.voltage / 1000).toFixed(2)}V (${currentData.battery.remaining}%)\n`;
          }
          
          if (currentData.heartbeat) {
            eventText += `System Status: ${currentData.heartbeat.system_status}\n`;
          }
          
          eventText += '\nUpload events.txt or safe_spots.txt for custom data';
          
          // Only update if no uploaded events are showing
          if (!events.includes('Events from') && !events.includes('Safe Spots from')) {
            setEvents(eventText);
          }
        }
      }
    }, [mode, playbackData, playbackIndex, events]);

    return (
      <div className="h-full flex flex-col">
        <Card className="h-full flex flex-col" style={{ contain: 'layout style paint' }}>
          <CardHeader className="py-2 px-3 flex-shrink-0" style={{ contain: 'layout' }}>
            <CardTitle className="text-lg font-semibold">Events Sequence</CardTitle>
          </CardHeader>
          <CardContent className="p-3 flex-1 flex flex-col" style={{ contain: 'layout' }}>
            <div className="flex-1 overflow-auto" style={{ contain: 'layout style paint' }}>
              <pre 
                className="whitespace-pre-wrap text-lg text-gray-800 font-mono leading-relaxed"
                style={{
                  minHeight: '200px',
                  transition: 'none',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'auto',
                  contain: 'layout style paint',
                  isolation: 'isolate',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
              >
                {events}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  });

  const [view, setView] = React.useState<'dashboard' | 'analytics'>('dashboard');

  const handleToggle = () => {
    setView(view === 'dashboard' ? 'analytics' : 'dashboard');
  };

  return (
    <div className="max-h-screen w-full flex flex-col">
      {/* Auto-collect button at the top of the page */}
      <AutoCollectButton />
      
      {/* File Upload and Playback Controls */}
      <div className="p-4">
        <FileUploadPlayback />
      </div>
      
      <main className="flex-1 h-full w-full">
        {view === 'dashboard' ? (
          <div
            className="
              grid
              h-full w-full
              grid-cols-[0.7fr_0.7fr_1.3fr_1.2fr]  
              gap-0
              border border-gray-300
            "
          >
            {/* Top Left Section: Safe Spot */}
            <section className="bg-white flex flex-col h-full w-full items-end" style={{ minHeight: 0, maxHeight: 650 }}>
              <div className="h-full w-full">
                <DashboardSafeSpot />
              </div>
            </section>
            {/* Events from Files beside Safe Spot */}
            <section className="bg-white flex flex-col h-full w-full items-end" style={{ minHeight: 0, maxHeight: 650 }}>
              <div className="h-full w-full">
                <JetsonEventsBox />
              </div>
            </section>
            {/* Top Middle Section: Parameters only */}
            <section className="bg-white flex flex-col h-full w-full items-end" style={{ minHeight: 0, maxHeight: 650 }}>
              <div className="h-full w-full">
                <DashboardParameters />
              </div>
            </section>
            {/* Top Right Section: YouTube feed shifted right */}
            <section className="bg-white flex flex-col h-full w-full pl-1 items-end" style={{ minHeight: 0, maxHeight: 650 }}>
              <div className="h-full w-full">
                <iframe
                  width="100%"
                  height="650"
                  src="https://www.youtube.com/embed/xRPjKQtRXR8?autoplay=1"
                  // src="https://www.youtube.com/embed/vIB0KMe26sk?autoplay=1"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="YouTube Live Stream"
                  style={{ background: '#000', display: 'block' }}
                />
              </div>
            </section>
            {/* Bottom Full-width Section: Z vs Time chart */}
            {/* width is 70% for lab use and can be adjusted for other monitors */}
            <section className="col-span-4 bg-white flex flex-col h-full w-full" style={{ minHeight: '400px', height: '500px', width: '80%' }}>
              <ZvsTimeChart data={graphData} />
            </section>
          </div>
        ) : (
          <div className="h-full w-full border border-gray-300">
            <section className="bg-white flex flex-col h-full w-full" style={{ minHeight: '400px', height: '500px' }}>
              <ZvsTimeChart />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
