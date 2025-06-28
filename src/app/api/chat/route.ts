import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    const { messages, aqi, risk, nearestFireDistance, nearestFireDirection, windSpeed, windDirection, latitude, longitude } = await request.json();

    const systemContext = {
        role: "user",
        parts: [{ text:
            `You are a helpful environmental assistant. The user is located at latitude ${latitude} and longitude ${longitude}. Their environment data:
            - Air Quality Index (AQI): ${aqi}
            - Fire Risk: ${risk}%
            - Nearest Fire: ${Math.round(nearestFireDistance)} km ${nearestFireDirection}
            - Wind: ${windSpeed} km/h ${windDirection}
            
            Do not assume the user is always asking about this — use it only if relevant. Otherwise, respond normally as an LLM would. Answer the questions in only a few sentences.`
        }]
    }

    const convertedMessages = messages.map((message: { role: string, content: string }) => ({
        role: message.role,
        parts: [{text: message.content}]
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({history: convertedMessages, systemInstruction: systemContext});

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(userMessage);

    const response = await result.response.text();

    return NextResponse.json({ reply: response });
}