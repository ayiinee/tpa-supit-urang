import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface WebSocketStatusProps {
    className?: string;
}

export default function WebSocketStatus({ className }: WebSocketStatusProps) {
    const { isConnected, lastUpdate, connectionError, reconnect } = useWebSocket();

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Wifi className="h-4 w-4 text-green-500" />
                            WebSocket Connected
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4 text-red-500" />
                            WebSocket Disconnected
                        </>
                    )}
                    <Badge variant={isConnected ? 'default' : 'destructive'} className="ml-auto">
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {lastUpdate && (
                    <p className="text-xs text-muted-foreground mb-2">
                        Last update: {lastUpdate.toLocaleTimeString()}
                    </p>
                )}
                
                {connectionError && (
                    <div className="space-y-2">
                        <p className="text-xs text-red-500">{connectionError}</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={reconnect}
                            className="w-full"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reconnect
                        </Button>
                    </div>
                )}

                {!connectionError && !isConnected && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={reconnect}
                        className="w-full"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Connect
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
