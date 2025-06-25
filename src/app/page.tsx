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
  // const [loading, setLoading] = useState(true)
  const [pinLs, setPinLs] = useState<{[key: number]: [number, number]}>({})
  const [index, setIndex] = useState(0)
  const [center, setCenter] = useState<[number, number]>([28.6, 77.2])
  const [zoom, setZoom] = useState(5)

  type csv = {
    latitude: string;
    longitude: string;
    acq_date: string;
    confidence: string;
    [key: string]: string;
  }

  useEffect(() => {
    fetch('IN.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data as csv[];

            let pinjs: { [key: number]: [number, number] } = {}
            data.forEach(row => {
              const lat = parseFloat(row.Lat);
              const lon = parseFloat(row.Lon);
              const pin = parseFloat(row.Pincode);
              if (!isNaN(lat) && !isNaN(lon) && !isNaN(pin)) {
                pinjs[pin] = [lat, lon];
              }
            });

            setPinLs(pinjs);
          }
        })
      })
  }, [])

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
    return Math.min(25, Math.max(3.5, frp / 5))
  }

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-white p-2 rounded shadow-md">
        {/* <button
          className='bg-blue-500 text-white px-4 py-2 rounded hover:cursor-pointer'
          onClick={() => {setIndex(0)}}
        >
          🔥
        </button>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded hover:cursor-pointer'
          onClick={() => {setIndex(1)}}
        >
          🔥
        </button> */}
      </div>
      <input className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 z-[1000] bg-white text-black p-2 rounded shadow-md"
        placeholder='Enter Pincode'
        onChange={(e) => {
          const pin = e.target.value;
          if (pin.length === 6) {
            console.log("hitting this")
            console.log(pinLs[parseFloat(pin)])
            setCenter(pinLs[parseFloat(pin)])
            setZoom(12);
            setIndex(1);
          }
          else if (pin.length === 0) {
            setIndex(0);
          }
        }
      }
      ></input>
      {(index == 0) && (
        <MapContainer center={[28.6, 77.2]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {firePoints.map((point: any, idx: number) => (
            <CircleMarker
              key={idx}
              center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
              radius={computeRadius(point.frp)}
              pathOptions={{ stroke: false, fillColor: 'red', fillOpacity: 0.4 }}
            >
              <Tooltip>
                <span>Date: {point.acq_date}<br />Time: {String(Math.floor(point.acq_time / 100)).padStart(2, '0')}:{String(point.acq_time % 100).padStart(2, '0')}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>
      )}
      {(index == 1) && (
        <>
          {/* <input className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 z-[1000] bg-white text-black p-2 rounded shadow-md"
            placeholder='Enter Pincode'
            onChange={(e) => {
              const pin = e.target.value;
              if (pin.length === 6) {
                console.log("hitting this")
                console.log(pinLs[parseFloat(pin)])
                setCenter(pinLs[parseFloat(pin)])
                setZoom(12);
                
              } 
            }
          }
          ></input> */}
          <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {firePoints.map((point: any, idx: number) => (
              <CircleMarker
                key={idx}
                center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                radius={computeRadius(point.frp)}
                pathOptions={{ stroke: false, fillColor: 'red', fillOpacity: 0.4 }}
              >
                <Tooltip>
                  <span>Date: {point.acq_date}<br />Time: {String(Math.floor(point.acq_time / 100)).padStart(2, '0')}:{String(point.acq_time % 100).padStart(2, '0')}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </>
      )}
    </div>
  )
}
