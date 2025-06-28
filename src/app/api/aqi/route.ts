import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";

export async function GET(request: NextRequest) {

    const { searchParams } = request.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const url = `https://api.api-ninjas.com/v1/airquality?lat=${lat}&lon=${lon}`;

    const res = await fetch(url, {
        headers: {
            "X-API-Key": process.env.API_NINJA_API_KEY || ''
        }
    });
    
    const resdata = await res.json();
    const aqi = resdata.overall_aqi || 0;

    return new NextResponse(aqi, {
        status: 200,
        headers: {
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
    })
}