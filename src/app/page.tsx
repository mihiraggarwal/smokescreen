'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Papa from 'papaparse'
import { toast } from 'react-hot-toast'
import 'dotenv/config'
import AppsIcon from '@mui/icons-material/Apps';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Modal from '@mui/material/Modal';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

import Dashboard from './_components/dash'
import HelpModal from './_components/help'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false })

export default function Home() {
  const [firePoints, setFirePoints] = useState<any[]>([])
  const [loadingAQI, setLoadingAQI] = useState(true)
  const [loadingRisk, setLoadingRisk] = useState(true)
  const [loadingFires, setLoadingFires] = useState(true)
  const [loadingLastFire, setLoadingLastFire] = useState(true)
  const [loadingWind, setLoadingWind] = useState(true)
  const [pinLs, setPinLs] = useState<{[key: number]: [number, number]}>({})
  const [index, setIndex] = useState(0)
  const [center, setCenter] = useState<[number, number]>([28.6, 77.2])
  const [zoom, setZoom] = useState(5)
  const [aqi, setAqi] = useState<number>(0)
  const [fireProbability, setFireProbability] = useState<number>(0)
  const [nearestFireDistance, setNearestFireDistance] = useState<number>(Infinity)
  const [nearestFireDirection, setNearestFireDirection] = useState<string>('')
  const [lastFireDaysAgo, setLastFireDaysAgo] = useState<number>(0)
  const [windSpeed, setWindSpeed] = useState<number>(0)
  const [windDirection, setWindDirection] = useState<string>('')
  const [dashboardVisible, setDashboardVisible] = useState(true)
  const [allPoints, setAllPoints] = useState<any[]>([])
  const [calendarPoints, setCalendarPoints] = useState<any[]>([])
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [helpVisible, setHelpVisible] = useState(false)

  type csv = {
    latitude: string;
    longitude: string;
    acq_date: string;
    confidence: string;
    [key: string]: string;
  }

  function getCompassDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const toDegrees = (rad: number) => rad * (180 / Math.PI);

    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);

    let brng = toDegrees(Math.atan2(y, x));
    brng = (brng + 360) % 360; // Normalize to 0–360

    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(brng / 45) % 8;
    return directions[index];
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
    fetch('/api/viirs/all')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data as csv[];
            const filtered = data.filter((row) => {
              return row.confidence && ['nominal', 'high'].includes(row.confidence.toLowerCase())
            })
            setAllPoints(filtered);
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
        setLoadingAQI(false);
      })
      .catch(err => {
        console.error("Error fetching AQI data:", err)
      })
    
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
          setLoadingRisk(false);
        }
        if (data && data.wind_speed) {
          setWindSpeed(data.wind_speed);
        }
        if (data && data.wind_direction) {
          const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          const index = Math.round(data.wind_direction / 45) % 8;
          setWindDirection(directions[index]);
        }
        setLoadingWind(false);
      })

    fetch(`/api/viirs/past?lat=${center[0]}&lon=${center[1]}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data !== undefined) {
          setLastFireDaysAgo(data.data);
        } else {
          setLastFireDaysAgo(8); // Default to 8 days if no data found
        }
        setLoadingLastFire(false);
      })

    // let count = 0;
    let minDist = Infinity;
    let direction;
    for (let i = 0; i < firePoints.length; i++) {
      const point = firePoints[i];
      const lat = parseFloat(point.latitude);
      const lon = parseFloat(point.longitude);
      let distance = Math.sqrt(Math.pow(lat - center[0], 2) + Math.pow(lon - center[1], 2));
      distance = distance * 111.32; // Convert to km (approximate conversion)
      
      if (distance < minDist) {
        minDist = distance;
        direction = getCompassDirection(center[0], center[1], lat, lon);
      }
    }
    setNearestFireDistance(minDist);
    setNearestFireDirection(direction!);
    setLoadingFires(false);
  }, [center])

  const computeRadius = (frpStr: string) => {
    const frp = parseFloat(frpStr)
    if (isNaN(frp)) return 2
    return Math.min(25, Math.max(3.5, frp / 5))
  }

  const filterCalendarPoints = (date: Dayjs) => {
    if (date.isSame(dayjs(), 'day')) {
      setCalendarPoints([]);
      return;
    }
    const formattedDate = date.format('YYYY-MM-DD');
    const filteredPoints = allPoints.filter(point => point.acq_date == formattedDate);
    setCalendarPoints(filteredPoints);
  }

  function Calendar() {
    return (
      <Modal open={calendarVisible} onClose={() => setCalendarVisible(false)}>
        <div className="absolute block mx-auto top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 z-[1000] bg-white p-4 rounded shadow-md text-black">
          <div className='mb-2 mt-2 flex flex-row justify-end'>
            <button
              className="ml-auto mr-6 px-4 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm border border-gray-300 transition-all hover:cursor-pointer" 
              onClick={() => {
                setSelectedDate(dayjs());
                setCalendarVisible(false);
                setCalendarPoints([])
              }}
            >
                Today
            </button>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar minDate={dayjs().subtract(7, 'day')} maxDate={dayjs()} value={selectedDate} onChange={((val) => {
              setSelectedDate(val);
              filterCalendarPoints(dayjs(val))
            })} />
          </LocalizationProvider>
        </div>
      </Modal>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-4 rounded-full">
        <button
          className='bg-black text-white px-2.5 py-2.5 rounded-full hover:cursor-pointer'
          onClick={() => setHelpVisible(!helpVisible)}
        >
          <QuestionMarkIcon />
        </button>
        <button
          className='bg-black text-white px-2.5 py-2.5 rounded-full hover:cursor-pointer'
          onClick={() => {
            setCalendarVisible(!calendarVisible);
          }}
        >
          <CalendarMonthIcon />
        </button>
      </div>
      <HelpModal open={helpVisible} onClose={() => setHelpVisible(false)} />
      {calendarVisible && (
          <Calendar />
      )}
      {(index === 1) && (
        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 bg-white rounded-full shadow-md">
          <button
            className='bg-black text-white rounded-full px-2.5 py-2.5 hover:cursor-pointer'
            onClick={() => {setDashboardVisible(!dashboardVisible)}}
          >
            <AppsIcon />
          </button>
        </div>
      )}
      <div className='absolute flex flex-col gap-4 top-4 sm:top-auto sm:bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 z-[1000]'>
        <input className="w-full bg-white text-black p-2 rounded shadow-md"
          placeholder='Enter Pincode (India)'
          onChange={(e) => {
            const pin = e.target.value;
            if (pin.length === 6) {
              if (!pinLs[parseFloat(pin)]) {
                toast.error('Invalid Pincode');
                return;
              }
              setLoadingAQI(true);
              setLoadingFires(true);
              setLoadingRisk(true);
              setCenter(pinLs[parseFloat(pin)])
              setZoom(12);
              setIndex(1);
              setSelectedDate(dayjs());
              setCalendarPoints([]);
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
        <>
          <MapContainer center={[28.6, 77.2]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {calendarPoints.length == 0 && (
              <>
                {firePoints.map((point: any, idx: number) => (
                  <CircleMarker
                    key={idx}
                    center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                    radius={computeRadius(point.frp)}
                    pathOptions={{ stroke: false, fillColor: 'red', fillOpacity: 0.4 }}
                  >
                    <Tooltip>
                      <span className='text-sm'>Date: {point.acq_date}<br />Time: {String(Math.floor(point.acq_time / 100)).padStart(2, '0')}:{String(point.acq_time % 100).padStart(2, '0')}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </>
            )}

            {calendarPoints.length > 0 && (
              <>
                {calendarPoints.map((point: any, idx: number) => (
                  <CircleMarker
                    key={idx}
                    center={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                    radius={computeRadius(point.frp)}
                    pathOptions={{ stroke: false, fillColor: 'red', fillOpacity: 0.4 }}
                  >
                    <Tooltip>
                      <span className='text-sm'>Date: {point.acq_date}<br />Time: {String(Math.floor(point.acq_time / 100)).padStart(2, '0')}:{String(point.acq_time % 100).padStart(2, '0')}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </>
            )}

          </MapContainer>
          
        </>
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
                  <span className='text-sm'>Date: {point.acq_date}<br />Time: {String(Math.floor(point.acq_time / 100)).padStart(2, '0')}:{String(point.acq_time % 100).padStart(2, '0')}<br />Fire Radiative Power: {point.frp || 'N/A'}</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>

          {dashboardVisible && (
            <Dashboard aqi={aqi} risk={fireProbability} nearestFireDistance={nearestFireDistance} nearestFireDirection={nearestFireDirection} lastFireDaysAgo={lastFireDaysAgo} windSpeed={windSpeed} windDirection={windDirection} latitude={center[0]} longitude={center[1]} loadingAQI={loadingAQI} loadingFires={loadingFires} loadingRisk={loadingRisk} loadingLastFire={loadingLastFire} loadingWind={loadingWind} />
          )}
        </>
      )}
    </div>
  )
}
