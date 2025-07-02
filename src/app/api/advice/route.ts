import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import 'dotenv/config';

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!});

export async function POST(req: NextRequest) {
  const { aqi, risk, nearestFireDistance, nearestFireDirection, windSpeed, windDirection, latitude, longitude } = await req.json();

  const model = genAI.models;

  const prompt = `
    You are an environmental assistant. Based on the following real-time data for latitude ${latitude} & longitude ${longitude}, give a short, clear 1-2 sentence advice to the user on what protective action they should take today, if any:

    - Air Quality Index (AQI): ${aqi}
    - Fire Risk: ${risk}%
    - Nearest Fire: ${Math.round(nearestFireDistance)} km ${nearestFireDirection}
    - Wind: ${windSpeed} km/h ${windDirection}
    `;

  const result = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const advice = result.text;

  return NextResponse.json({ advice });
}
