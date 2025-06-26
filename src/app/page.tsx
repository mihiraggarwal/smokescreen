'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Papa from 'papaparse'
import { toast } from 'react-hot-toast'
import 'dotenv/config'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false })

export default function Home() {
  const [firePoints, setFirePoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pinLs, setPinLs] = useState<{[key: number]: [number, number]}>({})
  const [index, setIndex] = useState(0)
  const [center, setCenter] = useState<[number, number]>([28.6, 77.2])
  const [zoom, setZoom] = useState(5)
  const [aqi, setAqi] = useState<number>(0)
  const [fireProbability, setFireProbability] = useState<number>(0)

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

  useEffect(() => {
    if (index === 0) return;
    fetch(`/api/aqi/?lat=${center[0]}&lon=${center[1]}`)
      .then(res => res.text())
      .then(data => {
        setAqi(parseFloat(data) || 0)
      })
      .catch(err => {
        console.error("Error fetching AQI data:", err)
      })
      .then(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: center[0],
            longitude: center[1],
            night: new Date().getHours() < 6 || new Date().getHours() > 18 ? 1 : 0,
            month: new Date().getMonth() + 1,
            day: new Date().getDate(),
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.fire_probability) {
              setFireProbability(Math.round(parseFloat(data.fire_probability)*100));
              setLoading(false);
            }
          })
      })
  }, [center])

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
      <div className='absolute flex flex-col gap-4 bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 z-[1000]'>
        {index === 1 && (
          <div className='flex flex-row w-full gap-2 justify-between text-black'>
            <div className='flex flex-col grow-1 px-2 py-4 bg-white rounded shadow-md items-center justify-between'>
              <p className='text-5xl pb-5 pt-6'>{loading ? "..." : aqi}</p>
              <p className='text-md'>AQI</p>
            </div>
            <div className='flex flex-col grow-1 px-2 py-4 bg-white rounded shadow-md items-center justify-between'>
              <p className='text-5xl pb-5 pt-6'>{loading ? "..." : fireProbability}%</p>
              <p className='text-md'>Fire Risk</p>
            </div>
            <div className='flex flex-col grow-5 px-2 py-4 bg-white rounded shadow-md items-center justify-between'>
              <p>AI Insight</p>
              <p>AI Insight</p>
            </div>
          </div>
        )}
        <input className="w-full bg-white text-black p-2 rounded shadow-md"
          placeholder='Enter Pincode'
          onChange={(e) => {
            const pin = e.target.value;
            if (pin.length === 6) {
              if (!pinLs[parseFloat(pin)]) {
                toast.error('Invalid Pincode');
                return;
              }
              setLoading(true);
              setIndex(1);
              setCenter(pinLs[parseFloat(pin)])
              setZoom(12);
            }
            else {
              setIndex(0);
              setCenter([28.6, 77.2]);
            }
          }
        }
        ></input>
      </div>
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
