from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import requests
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smokescreen-live.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    night: int
    month: int
    day: int
    latitude: float
    longitude: float

model = joblib.load("saved/fire_xgb_1.pkl")
scaler = joblib.load("saved/scaler.pkl")

def get_weather_features(lat: float, lon: float):
    base_url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "past_days": 10,
        "daily": "temperature_2m_max,precipitation_sum",
        "hourly": "wind_speed_10m,wind_direction_10m",
        "timezone": "auto"
    }

    res = requests.get(base_url, params=params)
    data = res.json()
    try:
        i = 0
        while data["daily"]["temperature_2m_max"][i] is None:
            i += 1
        temp = data["daily"]["temperature_2m_max"][i]

        j = 0
        while data["daily"]["precipitation_sum"][j] is None:
            j += 1
        rain = data["daily"]["precipitation_sum"][0]

        k = 0
        while data["hourly"]["wind_speed_10m"][k] is None:
            k += 1
        wind_speed = data["hourly"]["wind_speed_10m"][k]

        l = 0
        while data["hourly"]["wind_direction_10m"][l] is None:
            l += 1
        wind_direction = data["hourly"]["wind_direction_10m"][l]
    except (KeyError, IndexError):
        raise ValueError("Weather data not available for this location/date")

    return [rain, temp, wind_speed, wind_direction]

@app.post("/predict")
def predict(data: InputData):
    try:
        weather_features = get_weather_features(data.latitude, data.longitude)
        rainfall = weather_features[0]
        temp = weather_features[1]
        print(f"Rainfall: {rainfall}, Temperature: {temp}")
    except ValueError as e:
        return {"error": str(e)}
    
    raw = [[data.night, rainfall, temp, data.month, data.day, data.longitude, data.latitude]]
    raw = pd.DataFrame(raw, columns=["night", "rainfall", "temperature", "month", "day", "longitude", "latitude"])

    features = scaler.transform(raw)
    prob = model.predict_proba(features)[0][1]
    prob = float(prob)
    
    return {"fire_probability": prob, "wind_speed": weather_features[2], "wind_direction": weather_features[3]}