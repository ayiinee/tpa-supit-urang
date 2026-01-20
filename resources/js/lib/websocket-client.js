// resources/js/utils/websocket-client.js
class SerialWebSocketClient {
    constructor(url = 'ws://localhost:8765') {
        this.url = url;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.callbacks = {};
    }

    connect() {
        try {
            this.socket = new WebSocket(this.url);
            
            this.socket.onopen = (event) => {
                console.log('WebSocket connected to serial handler');
                this.reconnectAttempts = 0;
                this.triggerCallback('onopen', event);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed');
                this.triggerCallback('onclose', event);
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.triggerCallback('onerror', error);
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }

    handleMessage(data) {
        const { type } = data;

        switch (type) {
            case 'weight_update':
                this.triggerCallback('onWeightUpdate', data);
                break;
            case 'ports_list':
                this.triggerCallback('onPortsList', data.ports);
                break;
            case 'port_set_result':
                this.triggerCallback('onPortSetResult', data);
                break;
            case 'current_port':
                this.triggerCallback('onCurrentPort', data.port);
                break;
            case 'port_disconnected':
                this.triggerCallback('onPortDisconnected', data);
                break;
            case 'error':
                this.triggerCallback('onError', data.message);
                break;
            default:
                console.log('Unknown message type:', type, data);
        }
    }

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    // API Methods
    scanPorts() {
        this.send({ type: 'scan_ports' });
    }

    setPort(port) {
        this.send({ type: 'set_port', port });
    }

    getCurrentPort() {
        this.send({ type: 'get_current_port' });
    }

    disconnectPort() {
        this.send({ type: 'disconnect_port' });
    }

    // Event handling
    on(event, callback) {
        this.callbacks[event] = callback;
    }

    off(event) {
        delete this.callbacks[event];
    }

    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
            this.triggerCallback('onMaxReconnectAttemptsReached');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

export default SerialWebSocketClient;