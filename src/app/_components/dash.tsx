'use client'

export default function Dashboard({aqi, risk, nearestFireDistance, nearestFireDirection, lastFireDaysAgo, windSpeed, windDirection}: {aqi: number, risk: number, nearestFireDistance: number, nearestFireDirection: string, lastFireDaysAgo: number, windSpeed: number, windDirection: string}) {

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
        2: "Unhealthy for Sensitive Groups",
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

  return (
    <div className="z-[999] flex flex-col justify-between h-5/6 w-full absolute gap-2 top-0 right-0 p-2 rounded text-black">
      <div className="max-w-7xl mx-auto">
        {/* Grid for cards */}
        <div className="grid gap-6 sm:grid-cols-4 lg:grid-cols-5 mb-8">
          
          {/* AQI Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Current AQI</h3>
            {/* <p className="text-4xl font-bold text-red-500">{aqi}</p> */}
            <p className={`text-4xl font-bold ${aqiColors[(Math.floor(aqi / 50) <= 6 ? Math.floor(aqi / 50) : 6)]}`}>{aqi}</p>
            <p className="text-sm text-gray-500">{aqiText[(Math.floor(aqi / 50) <= 6 ? Math.floor(aqi / 50) : 6)]}</p>
          </div>
            {/* <div className='flex flex-col grow-1 px-2 py-4 bg-white rounded shadow-md items-center justify-between'>
                <p className='text-5xl pb-5 pt-6'>{loadingAQI ? "..." : aqi}</p>
                <p className='text-5xl pb-5 pt-6'>122</p>
                <p className='text-md'>AQI</p>
            </div> */}

          {/* Fire Risk Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Fire Risk</h3>
            <p className={`text-4xl font-bold ${fireRiskColors[(Math.floor(risk / 25))]}`}>{fireRiskText[Math.floor(risk / 25)]}</p>
            <p className="text-sm text-gray-500">Based on AI weather model</p>
          </div>
          {/* <div className='flex flex-col grow-1 px-2 py-4 bg-white rounded shadow-md items-center justify-between'>
              <p className='relative w-full text-right pr-4 text-sm text-gray-500'>Predicted using AI</p>
              <p className='text-5xl pb-5 pt-6'>{loadingRisk ? "..." : fireProbability}%</p>
              <p className='text-5xl pb-5 pt-6'>10%</p>
              <p className='text-md'>Fire Risk</p>
            </div> */}

          {/* Nearest Fire Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Nearest Fire</h3>
            <p className="text-4xl font-bold text-gray-700">{Math.round(nearestFireDistance)} km</p>
            <p className="text-sm text-gray-500">{nearestFireDirection}</p>
          </div>

          {/* Last Fire Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Last Nearby Fire</h3>
            <p className="text-3xl font-bold text-gray-700">{lastFireDaysAgo <= 7 ? lastFireDaysAgo : "7+"} Days Ago</p>
            <p className="text-sm text-gray-500">Data by NASA</p>
          </div>

          {/* Wind Info Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Wind</h3>
            <p className="text-gray-700">{windSpeed} km/h {windDirection}</p>
            <p className="text-sm text-gray-500">Carries smoke {smokeTowardOrAway(windDirection, nearestFireDirection)} your location</p>
          </div>

        </div>

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mb-8">

          {/* Advice Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">Today's Advice</h3>
            <p className="text-gray-700">Avoid outdoor activities between 2–5 PM due to expected pollution rise.</p>
          </div>

          {/* Cause Card */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">What's Causing This AQI?</h3>
            <p className="text-gray-700">Smoke from crop burning</p>
          </div>

          {/* AQI Trend Card (Placeholder) */}
          {/* <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-2">AQI Trend</h3>
            <p className="text-gray-700">Past 3 days: 98 → 125 → 156</p>
          </div> */}
        </div>
    </div>

    <div className="max-w-7xl w-full h-full mx-auto">
        {/* Chatbot section */}
        <div className="bg-white shadow-lg h-full rounded-xl p-5 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Chat with FireSense 🤖</h3>
          <div className="text-sm text-gray-700 mb-2">You can ask questions like:</div>
          <ul className="text-sm list-disc list-inside text-gray-600">
            <li>What is AQI?</li>
            <li>Why is the fire risk high?</li>
            <li>Should I stay indoors today?</li>
            <li>How far is the nearest fire?</li>
          </ul>
          {/* Add chatbot component or input box below */}
        </div>
      </div>
    </div>
  )
}
