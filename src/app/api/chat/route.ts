import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import 'dotenv/config';

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!});

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

    const chat = genAI.chats.create({
        model: "gemini-2.5-flash",
        history: convertedMessages,
        config: {
            systemInstruction: systemContext,
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage({message: userMessage});

    const response = result.text;

    return NextResponse.json({ reply: response });
}