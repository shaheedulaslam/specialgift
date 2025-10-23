export default function MapView({ lat, lon }: { lat: number; lon: number }) {
  if (!lat || !lon) return null

  const mapUrl = `https://www.google.com/maps?q=${lat},${lon}&hl=en&z=14&output=embed`

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm h-64">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  )
}
