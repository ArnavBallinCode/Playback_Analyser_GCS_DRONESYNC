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

  // Events from Files Component - Shows events from uploaded files
  const JetsonEventsBox = React.memo(() => {
    const [events, setEvents] = React.useState('Events Sequence: Upload TXT file for events using buttons above');
    const { mode, playbackData, playbackIndex } = useAutoCollect();

    // Listen for events upload
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
        
        // Update events display to show safe spots info
        setEvents(prev => prev + '\n\n' + safeSpotText);
      };

      window.addEventListener('eventsUploaded', handleEventsUpload);
      window.addEventListener('safeSpotsUploaded', handleSafeSpotsUpload);

      return () => {
        window.removeEventListener('eventsUploaded', handleEventsUpload);
        window.removeEventListener('safeSpotsUploaded', handleSafeSpotsUpload);
      };
    }, []);

    // Update events based on playback data
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
          
          setEvents(eventText);
        }
      }
    }, [mode, playbackData, playbackIndex]);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.name.endsWith('.txt')) {
            // Handle TXT file - simple text content
            setEvents(content);
            console.log('Loaded TXT events file');
          } else {
            // Handle JSON file
            const jsonData = JSON.parse(content);
            let eventsList: any[] = [];
            
            if (Array.isArray(jsonData)) {
              eventsList = jsonData;
            } else if (jsonData.events && Array.isArray(jsonData.events)) {
              eventsList = jsonData.events;
            } else {
              eventsList = [jsonData];
            }

            setEventsData(eventsList);
            console.log(`Loaded ${eventsList.length} events`);
            updateEventsDisplay();
          }
        } catch (error) {
          console.error('Error parsing events file:', error);
          alert('Error parsing events file. Please check the format.');
        }
      };
      reader.readAsText(file);
    };

    // Handle safe spots file upload
    const handleSafeSpotsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          
          let spotsList: any[] = [];
          if (Array.isArray(jsonData)) {
            spotsList = jsonData;
          } else if (jsonData.safeSpots && Array.isArray(jsonData.safeSpots)) {
            spotsList = jsonData.safeSpots;
          } else if (jsonData.safe_spots && Array.isArray(jsonData.safe_spots)) {
            spotsList = jsonData.safe_spots;
          } else {
            spotsList = [jsonData];
          }

          setSafeSpotsData(spotsList);
          console.log(`Loaded ${spotsList.length} safe spots`);
          updateEventsDisplay();
        } catch (error) {
          console.error('Error parsing safe spots file:', error);
          alert('Error parsing safe spots file. Please check the format.');
        }
      };
      reader.readAsText(file);
    };

    // Update events display based on all data sources
    const updateEventsDisplay = React.useCallback(() => {
      let displayText = 'Events Sequence\n\n';

      // Show events data
      if (eventsData.length > 0) {
        displayText += `📅 Events (${eventsData.length} total):\n`;
        eventsData.slice(0, 10).forEach((event, index) => {
          displayText += `${index + 1}. ${event.type || 'Event'}: ${event.message || event.description || 'No description'}\n`;
          if (event.timestamp) displayText += `   Time: ${event.timestamp}\n`;
        });
        if (eventsData.length > 10) {
          displayText += `... and ${eventsData.length - 10} more events\n`;
        }
        displayText += '\n';
      }

      // Show safe spots data
      if (safeSpotsData.length > 0) {
        displayText += `🛡️ Safe Spots (${safeSpotsData.length} total):\n`;
        safeSpotsData.forEach((spot, index) => {
          displayText += `${index + 1}. Spot ${spot.id || index + 1}: `;
          if (spot.lat && spot.lng) {
            displayText += `Lat ${spot.lat.toFixed(6)}, Lng ${spot.lng.toFixed(6)}\n`;
          } else if (spot.x && spot.y) {
            displayText += `X ${spot.x.toFixed(2)}, Y ${spot.y.toFixed(2)}\n`;
          } else {
            displayText += `${JSON.stringify(spot)}\n`;
          }
        });
        displayText += '\n';
      }

      // Show current playback info if available
      if (mode === 'playback' && playbackData.length > 0 && playbackIndex < playbackData.length) {
        const currentData = playbackData[playbackIndex];
        displayText += `🔄 Current Playback (${playbackIndex + 1}/${playbackData.length}):\n`;
        
        if (currentData.timestamp) {
          displayText += `Time: ${currentData.timestamp}\n`;
        }
        
        if (currentData.position) {
          displayText += `Position: X=${currentData.position.x.toFixed(2)}, Y=${currentData.position.y.toFixed(2)}, Z=${currentData.position.z.toFixed(2)}\n`;
        }
        
        if (currentData.battery) {
          displayText += `Battery: ${(currentData.battery.voltage / 1000).toFixed(2)}V (${currentData.battery.remaining}%)\n`;
        }
      }

      if (eventsData.length === 0 && safeSpotsData.length === 0 && mode !== 'playback') {
        displayText = 'Events Sequence\n\nUpload events and safe spots files to see the sequence data.\n\n📁 Events File: JSON with event data\n🛡️ Safe Spots File: JSON with safe zone coordinates';
      }

      setEvents(displayText);
    }, [eventsData, safeSpotsData, mode, playbackData, playbackIndex]);

    // Update display when data changes
    React.useEffect(() => {
      updateEventsDisplay();
    }, [updateEventsDisplay]);

    return (
      <div className="h-full flex flex-col">
        <Card className="h-full flex flex-col" style={{ contain: 'layout style paint' }}>
          <CardHeader className="py-2 px-3 flex-shrink-0" style={{ contain: 'layout' }}>
            <CardTitle className="text-lg font-semibold">Events Sequence</CardTitle>
          </CardHeader>
          <CardContent className="p-3 flex-1 flex flex-col" style={{ contain: 'layout' }}>
            {/* Upload Buttons */}
            <div className="flex gap-2 mb-3">
              <input
                ref={eventsFileRef}
                type="file"
                accept=".json,.txt"
                onChange={handleEventsUpload}
                className="hidden"
              />
              <input
                ref={safeSpotsFileRef}
                type="file"
                accept=".json,.txt"
                onChange={handleSafeSpotsUpload}
                className="hidden"
              />
              <button 
                onClick={() => eventsFileRef.current?.click()}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                📅 Upload Events
              </button>
              <button 
                onClick={() => safeSpotsFileRef.current?.click()}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                🛡️ Upload Safe Spots
              </button>
            </div>
            
            {/* Status Indicators */}
            <div className="flex gap-3 mb-2 text-xs text-gray-600">
              <span className={eventsData.length > 0 ? 'text-blue-600 font-medium' : ''}>
                Events: {eventsData.length} loaded
              </span>
              <span className={safeSpotsData.length > 0 ? 'text-green-600 font-medium' : ''}>
                Safe Spots: {safeSpotsData.length} loaded
              </span>
            </div>
            
            <div className="flex-1 overflow-auto" style={{ contain: 'layout style paint' }}>
              <pre 
                className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed"
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
            {/* Events from Jetson beside Safe Spot */}
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
            {/* Bottom Full-width Section: Z vs Time chart */
            /* width is 70% for lab use and can be adjusted for other monitors */}
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