'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Papa from 'papaparse'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false })

export default function Home() {
  const [firePoints, setFirePoints] = useState<any[]>([])

  type csv = {
    latitude: string;
    longitude: string;
    acq_date: string;
    confidence: string;
    [key: string]: string;
  }

  useEffect(() => {
    fetch('/api/viirs')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data as csv[];
            const filtered = data.filter((row) => {
              return row.confidence && ['nominal', 'high'].includes(row.confidence.toLowerCase())
            })
            setFirePoints(filtered)
          }
        })
      })
  }, [])

  const computeRadius = (frpStr: string) => {
    const frp = parseFloat(frpStr)
    if (isNaN(frp)) return 2
    return Math.min(20, Math.max(2, frp / 5))
  }

  return (
    <div className="h-screen w-screen">
      <MapContainer center={[28.6, 77.2]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {firePoints.map((point: any, idx: number) => (
          <CircleMarker
            key={idx}
            center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
            radius={computeRadius(point.frp)}
            pathOptions={{ color: 'red', fillColor: 'orange', fillOpacity: 0.6 }}
          >
            <Tooltip>
              <span>Date: {point.acq_date}<br />Confidence: {point.confidence}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
