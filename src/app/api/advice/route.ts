import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { aqi, risk, nearestFireDistance, nearestFireDirection, windSpeed, windDirection, latitude, longitude } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are an environmental assistant. Based on the following real-time data for latitude ${latitude} & longitude ${longitude}, give a short, clear 1-2 sentence advice to the user on what protective action they should take today, if any:

    - Air Quality Index (AQI): ${aqi}
    - Fire Risk: ${risk}%
    - Nearest Fire: ${Math.round(nearestFireDistance)} km ${nearestFireDirection}
    - Wind: ${windSpeed} km/h ${windDirection}
    `;

  const result = await model.generateContent(prompt);
  const advice = await result.response.text();

  console.log(advice)

  return NextResponse.json({ advice });
}
