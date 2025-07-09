# SmokeScreen

SmokeScreen is a personal air and fire awareness dashboard. It shows you where fires are burning nearby, how they might affect your air quality, and what precautions you should take — all in real time.

## Why It Matters

Fires are one of the biggest contributors to air pollution — especially during harvest seasons in South Asia. But while AQI numbers are everywhere, fire data has remained hidden — locked behind satellite systems and technical dashboards most people never see.  

SmokeScreen changes that. It makes real-time fire data visible, understandable, and personal. You can finally see where fires are burning near you, how far they are, and whether you need to take precautions today.

## Who This Is For

This platform is designed for everyday citizens, students, commuters, and health-conscious users who want to know: "What's burning near me?" and "Should I go outside today?"

## What It Does

- Shows active fire locations on a live map using NASA VIIRS satellite data
- Fetches real-time AQI and displays localized air quality levels
- Predicts fire risk in your area using a machine learning model trained on weather and satellite data
- Explains the causes behind high AQI, such as wind direction or nearby fires
- Gives actionable daily advice: whether to mask up, stay indoors, or enjoy clean air
- Includes a conversational assistant to answer any further questions

## Where The Data Comes From

- Fires: VIIRS satellite data from NASA FIRMS
- AQI: Sourced from API Ninjas
- Weather: Wind, rainfall, and temperature from Open-Meteo
- Predictions: Trained XGBoost model using satellite + weather data

## Tech Stack

- Frontend: Next.js, Typescript, Tailwind, Leaflet.js
- Backend: FastAPI
- ML Model: XGBoost
- Feature Extraction: Google Earth Engine
- LLM Integration: Google Generative AI API
- Hosting: Vercel + Render
