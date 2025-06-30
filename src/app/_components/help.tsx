'use client'

import * as React from 'react'
import { Modal, Box } from '@mui/material'

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-1/2 left-1/2 w-[90vw] max-w-3/4 max-h-[90vh] transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white p-6 shadow-lg">
        <h2 className="text-black text-center text-2xl font-bold mb-4">Welcome to SmokeScreen</h2>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">

          <section>
            <h3 className="text-lg font-semibold mb-1">What's This App?</h3>
            <p>
              SmokeScreen is a personal air and fire awareness dashboard.
              It shows you where fires are burning nearby, how they might affect your air quality, and what precautions you should take — all in real time.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-1">Why It Matters</h3>
            <p>
              Fires are one of the biggest contributors to air pollution — especially during harvest seasons in South Asia. But while AQI numbers are everywhere, fire data has remained hidden — locked behind satellite systems and technical dashboards most people never see.
            </p>
            <p>
              SmokeScreen changes that. It makes real-time fire data visible, understandable, and personal. You can finally see where fires are burning near you, how far they are, and whether you need to take precautions today.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-1">Who Is This For?</h3>
            <p>
              This platform is designed for everyday citizens, students, commuters, and health-conscious users
              who want to know: "What's burning near me?" and "Should I go outside today?"
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-1">What It Does</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Shows active fire locations on a live map using NASA VIIRS satellite data</li>
              <li>Fetches real-time AQI and displays localized air quality levels</li>
              <li>Predicts fire risk in your area using a machine learning model trained on weather and satellite data</li>
              <li>Explains the causes behind high AQI, such as wind direction or nearby fires</li>
              <li>Gives actionable daily advice: whether to mask up, stay indoors, or enjoy clean air</li>
              <li>Includes a conversational assistant to answer any further questions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-1">Where the Data Comes From</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Fires: VIIRS satellite data from NASA FIRMS</li>
              <li>AQI: Sourced from API Ninjas</li>
              <li>Weather: Wind, rainfall, and temperature from Open-Meteo</li>
              <li>Predictions: Powered by a trained XGBoost model using satellite + weather data</li>
            </ul>
          </section>

        </div>

        <div className="mt-8 text-center text-base text-gray-500">
          Created with <span className="text-red-500">&lt;3</span> by <a href="https://mihiraggarwal.me" target='_blank' className='underline text-blue-400'>Mihir Aggarwal</a>
        </div>
      </Box>
    </Modal>
  )
}
