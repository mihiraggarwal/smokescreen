import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";

export async function GET(request: NextRequest) {

    // get query parameters
    const { searchParams } = request.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    // const url = 'https://api.openaq.org/v3/parameters/2/latest?limit=1000&country=IN';
    // const url = 'https://api.openaq.org/v3/locations?country=IN&parameter=pm25&limit=1000'
    // const url = "https://api.api-ninjas.com/v1/airquality?city=Delhi"

    // const minLat = 8
    // const maxLat = 37
    // const minLon = 68
    // const maxLon = 97
    // const step = 5.0

    // let points = []

    // for (let lat = minLat; lat <= maxLat; lat += step) {
    //     for (let lon = minLon; lon <= maxLon; lon += step) {
    //         points.push({ lat: parseFloat(lat.toFixed(3)), lon: parseFloat(lon.toFixed(3)) });
    //     }
    // }

    // let aqis = []

    // for (const point of points) {

    const url = `https://api.api-ninjas.com/v1/airquality?lat=${lat}&lon=${lon}`;

    const res = await fetch(url, {
        headers: {
            "X-API-Key": process.env.API_NINJA_API_KEY || ''
        }
    });
    
    const resdata = await res.json();
    const aqi = resdata.overall_aqi || 0;
    // console.log(resdata);

    //     aqis.push({
    //         latitude: point.lat,
    //         longitude: point.lon,
    //         aqi: resdata.overall_aqi || 0
    //     })

    // }

    // console.log(aqis.length, aqis[0]);
    // const response = await fetch(url, {
    //     headers: {
    //         "X-API-Key": process.env.OPENAQ_API_KEY || ''
    //     }
    // });

    // if (!response.ok) {
    //     console.log(response)
    //     return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    // }
    // const data = await response.json();
    
    // return NextResponse.json(data, {
    //     status: 200,
    //     headers: {
    //         // "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    //     },
    // });

    return new NextResponse(aqi, {
        status: 200,
        headers: {
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
    })
}