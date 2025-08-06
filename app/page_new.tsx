"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardParameters } from "@/components/dashbard-parameters"
import DashboardSafeSpot from "@/components/dashboard-safespot"
import ZvsTimeChart from "@/components/dashboard-z_vs_t-graph"
import { AutoCollectButton } from "@/components/auto-collect-button"
import { useAutoCollect } from "@/contexts/auto-collect-context"


export default function DashboardPage() {
    const { graphData, autoCollect } = useAutoCollect()

    // Memoize the Events component to prevent unnecessary re-renders
    const JetsonEventsBox = React.useMemo(() => React.memo(() => {
        const [events, setEvents] = React.useState('');
        const contentHashRef = React.useRef('');
        const isProcessingRef = React.useRef(false);
        const containerRef = React.useRef<HTMLDivElement>(null);

        // Simple hash function for content comparison
        const hashContent = (content: string) => {
            let hash = 0;
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString();
        };

        const fetchEvents = React.useCallback(async () => {
            // Prevent overlapping requests to stop flickering
            if (isProcessingRef.current) return;

            try {
                isProcessingRef.current = true;
                const response = await fetch('/api/status-text', {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                const result = await response.json();

                if (result.data) {
                    const cleanedContent = result.data.trim();
                    const contentHash = hashContent(cleanedContent);

                    // Only update if content hash actually changed to prevent flickering
                    if (contentHash !== contentHashRef.current) {
                        contentHashRef.current = contentHash;
                        setEvents(cleanedContent);

                        // Auto-scroll to bottom after content update
                        setTimeout(() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTop = containerRef.current.scrollHeight;
                            }
                        }, 100);
                    }
                }
            } catch {
                // Silent - background service handles connectivity
            } finally {
                isProcessingRef.current = false;
            }
        }, []);

        React.useEffect(() => {
            fetchEvents();
            const interval = setInterval(fetchEvents, 5000); // Even slower updates to reduce flickering
            return () => clearInterval(interval);
        }, [fetchEvents]);

        return (
            <div className="h-full flex flex-col">
                <Card className="h-full flex flex-col" style={{ contain: 'strict' }}>
                    <CardHeader className="py-2 px-3 flex-shrink-0" style={{ contain: 'layout' }}>
                        <CardTitle className="text-lg font-semibold">Events from Drone</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex-1 flex flex-col" style={{ contain: 'strict' }}>
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-auto scroll-smooth"
                            style={{ contain: 'strict', maxHeight: '100%' }}
                        >
                            <pre
                                className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed h-full"
                                style={{
                                    minHeight: '100%',
                                    maxHeight: 'none',
                                    height: 'auto',
                                    transition: 'none',
                                    backfaceVisibility: 'hidden',
                                    transform: 'translate3d(0,0,0)',
                                    willChange: 'auto',
                                    contain: 'none',
                                    isolation: 'isolate',
                                    WebkitFontSmoothing: 'antialiased',
                                    MozOsxFontSmoothing: 'grayscale',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}
                            >
                                {events || 'Connecting to Jetson...'}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }), []);

    const [view, setView] = React.useState<'dashboard' | 'analytics'>('dashboard');

    const handleToggle = () => {
        setView(view === 'dashboard' ? 'analytics' : 'dashboard');
    };

    return (
        <div className="max-h-screen w-full flex flex-col">
            {/* Auto-collect button at the top of the page */}
            <AutoCollectButton />
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
                                    src="https://youtube.com/embed/308mPu-G8CQ?autoplay=1"
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