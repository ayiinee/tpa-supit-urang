import { useEffect, useRef, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Extend window object to include Pusher
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

interface WeightData {
    berat: number;
    sensor: string;
    timestamp: string;
}

interface WebSocketConfig {
    host?: string;
    port?: number;
    key?: string;
    cluster?: string;
    forceTLS?: boolean;
}

export const useWebSocket = (config?: WebSocketConfig) => {
    const [isConnected, setIsConnected] = useState(false);
    const [liveWeight, setLiveWeight] = useState<number>(0);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const echoRef = useRef<Echo<any> | null>(null);

    useEffect(() => {
        // Set up Pusher globally
        window.Pusher = Pusher;

        // Default configuration for Laravel Reverb
        const defaultConfig = {
            host: config?.host || 'localhost',
            port: config?.port || 8080,
            key: config?.key || 'local-key',
            cluster: config?.cluster || 'mt1',
            forceTLS: config?.forceTLS || false,
        };

        try {
            // Initialize Laravel Echo with Reverb
            const echo = new Echo({
                broadcaster: 'reverb',
                key: defaultConfig.key,
                wsHost: defaultConfig.host,
                wsPort: defaultConfig.port,
                wssPort: defaultConfig.port,
                forceTLS: defaultConfig.forceTLS,
                enabledTransports: ['ws', 'wss'],
                // Additional Reverb-specific options
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                },
            });

            echoRef.current = echo;
            window.Echo = echo;

            // Listen for connection events
            const connector = echo.connector as any;
            if (connector.pusher) {
                connector.pusher.connection.bind('connected', () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                    setConnectionError(null);
                });

                connector.pusher.connection.bind('disconnected', () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                });

                connector.pusher.connection.bind('error', (error: any) => {
                    console.error('WebSocket error:', error);
                    setConnectionError(error.message || 'Connection error');
                    setIsConnected(false);
                });
            }

            // Listen to weight updates
            echo.channel('weight-channel')
                .listen('.WeightUpdated', (data: WeightData) => {
                    console.log('Weight update received:', data);
                    setLiveWeight(data.berat);
                    setLastUpdate(new Date(data.timestamp));
                });

            console.log('WebSocket initialized');

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            setConnectionError(error instanceof Error ? error.message : 'Initialization error');
        }

        // Cleanup on unmount
        return () => {
            if (echoRef.current) {
                echoRef.current.disconnect();
                echoRef.current = null;
            }
        };
    }, [config]);

    const reconnect = () => {
        if (echoRef.current) {
            echoRef.current.disconnect();
            // Re-initialize will happen on next render due to useEffect
            setConnectionError(null);
        }
    };

    return {
        isConnected,
        liveWeight,
        lastUpdate,
        connectionError,
        reconnect,
    };
};

export default useWebSocket;
