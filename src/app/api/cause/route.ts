import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { aqi, risk, nearestFireDistance, nearestFireDirection, windSpeed, windDirection, latitude, longitude } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are an environmental analysis assistant. A user in latitude ${latitude} and longitude ${longitude} has an AQI of ${aqi} today.

    Context:
    - Air Quality Index (AQI): ${aqi}
    - Fire Risk: ${risk}%
    - Nearest Fire: ${Math.round(nearestFireDistance)} km ${nearestFireDirection}
    - Wind: ${windSpeed} km/h ${windDirection}

    In 1-2 sentences, explain why the AQI might be high today. Do not assume the answer to lie within the information provided — use it only if relevant. Avoid defining AQI or giving general pollution info — focus on specific possible causes today.
    `;

  const result = await model.generateContent(prompt);
  const reason = await result.response.text();

  return NextResponse.json({ reason });
}
