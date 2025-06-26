from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import requests
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
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
        "timezone": "auto"
    }

    res = requests.get(base_url, params=params)
    data = res.json()
    print(data)
    try:
        temp = data["daily"]["temperature_2m_max"][0]
        rain = data["daily"]["precipitation_sum"][0]
    except (KeyError, IndexError):
        raise ValueError("Weather data not available for this location/date")

    return [rain, temp]

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
    
    return {"fire_probability": prob}