<?php
namespace App\Services;

use Ratchet\Client\WebSocket;
use Ratchet\Client\Connector;
use React\EventLoop\Loop;
use Illuminate\Support\Facades\Log;

class WebSocketService
{
    private $connector;
    private $connection = null;
    private $loop;
    
    public function __construct()
    {
        $this->loop = Loop::get();
        $this->connector = new Connector($this->loop);
    }
    
    public function connect()
    {
        if ($this->connection) {
            return $this->connection;
        }
        
        $promise = ($this->connector)('ws://localhost:5000/socket.io/?EIO=4&transport=websocket');
        
        $promise->then(function (WebSocket $conn) {
            $this->connection = $conn;
            
            $conn->on('message', function ($msg) {
                Log::info('WebSocket message received: ' . $msg);
            });
            
            $conn->on('close', function ($code = null, $reason = null) {
                Log::info('WebSocket connection closed', ['code' => $code, 'reason' => $reason]);
                $this->connection = null;
            });
            
        }, function (\Exception $e) {
            Log::error('WebSocket connection failed: ' . $e->getMessage());
        });
        
        return $promise;
    }
    
    public function emit($event, $data)
    {
        if (!$this->connection) {
            $this->connect();
        }
        
        if ($this->connection) {
            $message = json_encode(['event' => $event, 'data' => $data]);
            $this->connection->send($message);
        }
    }
    
    public function disconnect()
    {
        if ($this->connection) {
            $this->connection->close();
            $this->connection = null;
        }
    }
}

