import { ExternalLink, MapPin } from 'lucide-react';

export default function LocationMap({ location, title, note }: { location: string; title: string; note?: string }) {
  const query = encodeURIComponent(location);
  return <div className="location-map">
    <iframe key={location} title={title} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    <div className="map-caption"><div><span><MapPin size={15} />{location}</span>{note && <p>{note}</p>}</div><a href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer">Open Google Maps <ExternalLink size={14} /></a></div>
  </div>;
}
