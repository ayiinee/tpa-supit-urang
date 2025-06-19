import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function TruckMap({ trucks }: { trucks: any[] }) {
  return (
    <MapContainer center={[-7.935, 112.637]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {trucks.map((truck, i) => (
        <Marker
          key={i}
          position={[truck.latitude, truck.longitude]}
          icon={icon}
        >
          <Popup>
            <strong>{truck.no_lambung}</strong><br />
            {new Date(truck.created_at).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
