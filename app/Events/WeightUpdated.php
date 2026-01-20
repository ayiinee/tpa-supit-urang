<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WeightUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $berat;
    public $sensor;
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct($berat, $sensor = 'LEFT')
    {
        $this->berat = $berat;
        $this->sensor = $sensor;
        $this->timestamp = now();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('weight-channel');
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $now = now();
        return [
            'berat' => $this->berat,
            'sensor' => $this->sensor,
            'timestamp' => $now->toISOString(), // Use current time for real-time
            'server_time' => $now->toISOString(),
            'data_age_ms' => 0, // Always 0 for real-time data
        ];
    }

    /**
     * Explicit event name for frontend listeners.
     */
    public function broadcastAs(): string
    {
        return 'WeightUpdated';
    }
}