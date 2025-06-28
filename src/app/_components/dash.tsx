'use client'

import { useEffect, useState } from "react";

export default function Dashboard({aqi, risk, nearestFireDistance, nearestFireDirection, lastFireDaysAgo, windSpeed, windDirection, latitude, longitude, loadingAQI, loadingRisk, loadingFires, loadingLastFire, loadingWind}: {aqi: number, risk: number, nearestFireDistance: number, nearestFireDirection: string, lastFireDaysAgo: number, windSpeed: number, windDirection: string, latitude: number, longitude: number, loadingAQI: boolean, loadingRisk: boolean, loadingFires: boolean, loadingLastFire: boolean, loadingWind: boolean}) {

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [advice, setAdvice] = useState("");
    const [cause, setCause] = useState("");
    const [loadingAdvice, setLoadingAdvice] = useState(true);
    const [loadingCause, setLoadingCause] = useState(true);

    const aqiColors: { [key: number]: string } = {
        0: "text-green-500",
        1: "text-yellow-500",
        2: "text-orange-500",
        3: "text-red-500",
        4: "text-red-700",
        5: "text-red-700",
        6: "text-red-800"
    }

    const aqiText: { [key: number]: string } = {
        0: "Good",
        1: "Moderate",
        2: "Harmful for Sensitive Groups",
        3: "Unhealthy",
        4: "Very Unhealthy",
        5: "Very Unhealthy",
        6: "Hazardous",
    }

    const fireRiskText: { [key: number]: string } = {
        0: "Low",
        1: "Moderate",
        2: "High",
        3: "Very High"
    }

    const fireRiskColors: { [key: number]: string } = {
        0: "text-green-500",
        1: "text-yellow-500",
        2: "text-orange-500",
        3: "text-red-500"
    }

    useEffect(() => {
        if (loadingAQI || loadingRisk || loadingFires || loadingLastFire || loadingWind) return;
        fetch('/api/advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aqi: aqi,
                risk: risk,
                nearestFireDistance: nearestFireDistance,
                nearestFireDirection: nearestFireDirection,
                windSpeed: windSpeed,
                windDirection: windDirection,
                latitude: latitude,
                longitude: longitude
            })
        })
        .then(res => res.json())
        .then(data => {
            const advice = data.advice;
            setAdvice(advice);
            setLoadingAdvice(false);
        })

        fetch('/api/cause', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aqi: aqi,
                risk: risk,
                nearestFireDistance: nearestFireDistance,
                nearestFireDirection: nearestFireDirection,
                windSpeed: windSpeed,
                windDirection: windDirection,
                latitude: latitude,
                longitude: longitude
            })
        })
        .then(res => res.json())
        .then(data => {
            const reason = data.reason;
            setCause(reason);
            setLoadingCause(false);
        })
    }, [loadingAQI, loadingRisk, loadingFires, loadingLastFire, loadingWind])

    function smokeTowardOrAway(direction1: string, direction2: string): string {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index1 = directions.indexOf(direction1);
        const index2 = directions.indexOf(direction2.split('-').map(dir => dir.charAt(0).toUpperCase()).join('')); // Normalize direction2 to match format

        if (index1 === -1 || index2 === -1) return "Unknown";

        const diff = (index2 - index1 + 8) % 8; // Normalize to 0-7
        
        if (diff === 3 || diff === 4 || diff === 5) {
            return "toward";
        } else {
            return "away from";
        }
    }

    async function submit() {

        setMessages([...messages, { role: 'user', content: input }]);
        setInput("");

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [...messages,
                    { role: 'user', content: input }
                ],
                aqi: aqi,
                risk: risk,
                nearestFireDistance: nearestFireDistance,
                nearestFireDirection: nearestFireDirection,
                windSpeed: windSpeed,
                windDirection: windDirection,
                latitude: latitude,
                longitude: longitude
            })
        })

        const data = await res.json();
        const reply = data.reply;

        setMessages([...messages, { role: 'user', content: input }, { role: 'model', content: reply }]);
    }

    const days = (num: number) => num <= 7 ? num : "7+";

  return (
    <div className="z-[999] flex flex-col justify-between h-11/12 max-h-11/12 w-full absolute top-0 right-0 p-2 rounded text-black">
      <div className="max-w-5/6 mx-auto">

        <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-5 mb-4">
          
          {/* AQI Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Current AQI</h3>
            <p className={`text-3xl font-bold ${aqiColors[(Math.floor(aqi / 50) <= 6 ? Math.floor(aqi / 50) : 6)]}`}>{loadingAQI ? "..." : aqi}</p>
            <p className="text-xs text-gray-500">{aqiText[(Math.floor(aqi / 50) <= 6 ? Math.floor(aqi / 50) : 6)]}</p>
          </div>

          {/* Fire Risk Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Fire Risk</h3>
            <p className={`text-3xl font-bold ${fireRiskColors[(Math.floor(risk / 25))]}`}>{loadingRisk ? "..." : fireRiskText[Math.floor(risk / 25)]}</p>
            <p className="text-xs text-gray-500">Based on AI weather model</p>
          </div>

          {/* Nearest Fire Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Nearest Fire</h3>
            <p className="text-3xl font-bold text-gray-700">{loadingFires ? "..." : Math.round(nearestFireDistance)} km</p>
            <p className="text-xs text-gray-500">{loadingFires ? "..." : nearestFireDirection}</p>
          </div>

          {/* Last Fire Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Last Nearby Fire</h3>
            <p className="text-2xl font-bold text-gray-700">{loadingLastFire ? "..." : days(lastFireDaysAgo)} Days Ago</p>
            <p className="text-xs text-gray-500">Data by NASA</p>
          </div>

          {/* Wind Info Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Wind</h3>
            <p className="text-gray-700">{loadingWind ? "..." : windSpeed} km/h {loadingWind ? "..." : windDirection}</p>
            <p className="text-xs text-gray-500">Carries smoke {smokeTowardOrAway(windDirection, nearestFireDirection)} your location</p>
          </div>

        </div>

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mb-4">

          {/* Advice Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">Today's AI Advice</h3>
            <p className="text-gray-700 text-sm">{loadingAdvice ? "Loading" : advice}</p>
          </div>

          {/* Cause Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-base font-semibold mb-2">What's Causing This AQI?</h3>
            <p className="text-gray-700 text-sm">{loadingCause ? "Loading..." : cause}</p>
          </div>

        </div>
      </div>

      <div className="max-w-5/6 mx-auto w-full h-full overflow-y-auto">
        <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col justify-between gap-2 h-full">

            {messages.length == 0 && (
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">Chat with SmokeScreen AI</h3>
                    <div className="text-sm text-gray-700 mb-2">You can ask questions like:</div>
                    <ul className="text-sm list-disc list-inside text-gray-600">
                        <li>What is AQI?</li>
                        <li>Should I stay indoors today?</li>
                        <li>How far is the nearest fire?</li>
                        <li>What could be causing this AQI?</li>
                    </ul>
                </div>
            )}

            {messages.length > 0 && (
                <div className="flex flex-col gap-4 overflow-y-scroll max-h-10/12 pr-2">
                    {messages.map((message, index) => (
                        <div key={index} className={`p-3 max-w-3/4 rounded-lg ${message.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
                            <p className="text-sm">{message.content}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-row gap-4">
                <input type="text" placeholder="Type your question here..." className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={input} onChange={(e) => setInput(e.target.value)} />
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={submit}>Send</button>
            </div>

        </div>
      </div>
    </div>
  )
}
