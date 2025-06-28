import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv";
    const response = await fetch(url);
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
    const csvText = await response.text();
    
    return new NextResponse(csvText, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
    });
}