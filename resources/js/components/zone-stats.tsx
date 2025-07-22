import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import ProgressBar from '@/components/ProgressBar';
import { RecycleIcon, Leaf, Trash2, Zap } from 'lucide-react';
import axios from 'axios';

interface ZoneData {
    zone_name: string;
    max_capacity: number;
    current_count: number;
}

export default function ZoneStats() {
    const [zoneData, setZoneData] = useState<ZoneData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZoneStats = async () => {
            try {
                const response = await axios.get('/api/zone-stats');
                setZoneData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching zone stats:', error);
                setLoading(false);
            }
        };

        // Fetch initial data
        fetchZoneStats();

        // Poll every 30 seconds for real-time updates
        const interval = setInterval(fetchZoneStats, 30000);

        return () => clearInterval(interval);
    }, []);

    const getZoneIcon = (zoneName: string) => {
        const IconComponent = {
            'Sorting Zone': RecycleIcon,
            'Composting Zone': Leaf,
            'Sanitary Landfill': Trash2,
        }[zoneName] || RecycleIcon;
        
        return IconComponent;
    };


    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <div className="flex flex-col gap-2 pr-4 pl-4 py-4">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {zoneData.map((zone) => {
                const percentage = (zone.current_count / zone.max_capacity) * 100;
                const IconComponent = getZoneIcon(zone.zone_name);
                
                return (
                    <Card key={zone.zone_name}>
                        <div className="flex flex-col gap-2 pr-4 pl-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center`}>
                                        <IconComponent className={`w-4 h-4`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {zone.zone_name}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {zone.current_count}/{zone.max_capacity}
                                </span>
                            </div>
                            <ProgressBar 
                                value={percentage} 
                                className="h-2"
                            />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}