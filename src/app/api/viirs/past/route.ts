import { NextRequest, NextResponse } from "next/server";
import Papa from 'papaparse'

export async function GET(request: NextRequest) {

    const params = request.nextUrl.searchParams;
    const lat = params.get("lat");
    const lon = params.get("lon");

    const url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv";
    const response = await fetch(url);
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
    const csvText = await response.text();

    let daysAgo = 0;

    Papa.parse(csvText, {
        header: true,
        complete: (results) => {
            const data = results.data as any[];
            const filtered = data.filter((row) => {
              return row.confidence && ['nominal', 'high'].includes(row.confidence.toLowerCase())
            })

            for (let i = filtered.length - 1; i >= 0; i--) {
                const row = filtered[i];
                const pointLat = parseFloat(row.latitude);
                const pointLon = parseFloat(row.longitude);

                const distance = Math.sqrt(Math.pow(pointLat - parseFloat(lat!), 2) + Math.pow(pointLon - parseFloat(lon!), 2));
                if (distance < 0.1) {
                    const today = new Date();
                    const acqDate = new Date(row.acq_date);
                    daysAgo = Math.floor((today.getTime() - acqDate.getTime()) / (1000 * 3600 * 24));
                    console.log(daysAgo)
                    return;
                }
            }

            daysAgo = 8;
        }
    });
    
    return NextResponse.json({data: daysAgo}, {
        status: 200,
    });
}