import { useEffect, useRef, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

interface WeightData {
    berat: number;
    sensor: string;
    timestamp: string;
    server_time?: string;
    data_age_ms?: number;
}

export const webSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [weights, setWeights] = useState({ left: 0, right: 0 });
    const [lastUpdates, setLastUpdates] = useState<{ left: Date | null; right: Date | null }>({
        left: null,
        right: null,
    });
    const [activeSensor, setActiveSensor] = useState<'LEFT' | 'RIGHT' | null>(null);
    const [lastEvent, setLastEvent] = useState<{ sensor: 'LEFT' | 'RIGHT'; berat: number; timestamp: string } | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const echoRef = useRef<any>(null);
    // Removed queue system for immediate processing

    useEffect(() => {
        // Set up Pusher globally
        window.Pusher = Pusher;

        const initializeWebSocket = () => {
            try {
                // OPTIMIZED: Simple Reverb configuration with minimal overhead
                const echo = new Echo({
                    broadcaster: 'reverb',
                    key: 'xqgq97ekkooqgap2t3jq', // Use actual key from Laravel config
                    wsHost: 'localhost',
                    wsPort: 8080,
                    wssPort: 8080,
                    forceTLS: false,
                    enabledTransports: ['ws'],
                    disableStats: true,
                    // OPTIMIZED: Additional performance settings
                    activityTimeout: 30000,
                    pongTimeout: 6000,
                });

                echoRef.current = echo;

                // Connection event handlers with better error handling
                const connector = echo.connector as any;
                
                if (connector && connector.pusher) {
                    connector.pusher.connection.bind('connected', () => {
                        console.log('✅ WebSocket connected successfully');
                        setIsConnected(true);
                        setConnectionError(null);
                    });

                    connector.pusher.connection.bind('disconnected', () => {
                        console.log('❌ WebSocket disconnected');
                        setIsConnected(false);
                        setWeights({ left: 0, right: 0 });
                        setLastUpdates({ left: null, right: null });
                        setActiveSensor(null);
                        setLastEvent(null);
                    });

                    connector.pusher.connection.bind('error', (error: any) => {
                        console.error('❌ WebSocket connection error:', error);
                        setConnectionError(`Connection failed: ${error.error?.message || error.message || 'Unknown error'}`);
                        setIsConnected(false);
                        setWeights({ left: 0, right: 0 });
                        setLastUpdates({ left: null, right: null });
                        setActiveSensor(null);
                        setLastEvent(null);
                    });

                    connector.pusher.connection.bind('unavailable', () => {
                        console.error('❌ WebSocket service unavailable');
                        setConnectionError('WebSocket service unavailable. Please check if Reverb server is running on port 8080.');
                        setIsConnected(false);
                        setWeights({ left: 0, right: 0 });
                        setLastUpdates({ left: null, right: null });
                        setActiveSensor(null);
                        setLastEvent(null);
                    });

                    connector.pusher.connection.bind('failed', () => {
                        console.error('❌ WebSocket connection failed');
                        setConnectionError('WebSocket connection failed. Check network and server status.');
                        setIsConnected(false);
                        setWeights({ left: 0, right: 0 });
                        setLastUpdates({ left: null, right: null });
                        setActiveSensor(null);
                        setLastEvent(null);
                    });
                } else {
                    console.error('❌ WebSocket connector not available');
                    setConnectionError('WebSocket connector initialization failed');
                }

                // Listen to weight updates on public channel with immediate processing
                echo.channel('weight-channel').listen('.WeightUpdated', (data: WeightData) => {
                    // OPTIMIZED: Reduced logging for better performance

                    // Handle disconnection
                    if (data.sensor === 'DISCONNECTED') {
                        setWeights({ left: 0, right: 0 });
                        setLastUpdates({ left: new Date(data.timestamp), right: new Date(data.timestamp) });
                        setActiveSensor(null);
                        setLastEvent(null);
                        return;
                    }

                    const sensorName = data.sensor?.toUpperCase();
                    if (sensorName === 'LEFT' || sensorName === 'RIGHT') {
                        const key = sensorName === 'LEFT' ? 'left' : 'right';

                        setWeights((prev) => ({ ...prev, [key]: data.berat }));
                        setLastUpdates((prev) => ({ ...prev, [key]: new Date(data.timestamp) }));
                        setActiveSensor(sensorName);
                        setLastEvent({ sensor: sensorName, berat: data.berat, timestamp: data.timestamp });
                    }
                });

                console.log('🚀 WebSocket listener initialized');

            } catch (error) {
                console.error('❌ Failed to initialize WebSocket:', error);
                setConnectionError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsConnected(false);
            }
        };

        // Initialize WebSocket
        initializeWebSocket();

        // Cleanup on unmount
        return () => {
            if (echoRef.current) {
                console.log('🔄 Cleaning up WebSocket connection...');
                echoRef.current.disconnect();
                echoRef.current = null;
            }
        };
    }, []);

    // Removed queue processing function - now using immediate processing

    const reconnect = () => {
        console.log('🔄 Attempting to reconnect WebSocket...');
        if (echoRef.current) {
            echoRef.current.disconnect();
            echoRef.current = null;
        }
        setConnectionError(null);
        setIsConnected(false);
        
        // Re-initialize after a short delay
        setTimeout(() => {
            window.location.reload(); // Simple approach: reload the page
        }, 1000);
    };

    return {
        isConnected,
        weights,
        lastUpdates,
        activeSensor,
        activeWeight: lastEvent ? lastEvent.berat : 0,
        activeLastUpdate: lastEvent ? new Date(lastEvent.timestamp) : null,
        connectionError,
        reconnect,
    };
};

export default webSocket;
