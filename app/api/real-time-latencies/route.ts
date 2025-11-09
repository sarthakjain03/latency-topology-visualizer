import { NextResponse } from "next/server";
import axios from "axios";

function toISOStringUTC(date: Date) {
  return date.toISOString().split(".")[0] + "Z";
}

export async function GET() {
  try {
    const dateEnd = new Date();
    const dateStart = new Date(dateEnd.getTime() - 30 * 60 * 1000); // api requires minimum of 30 mins gap

    const response = await axios.get(
      "https://api.cloudflare.com/client/v4/radar/quality/iqi/timeseries_groups",
      {
        params: {
          metric: "latency",
          dateEnd: toISOStringUTC(dateEnd),
          dateStart: toISOStringUTC(dateStart),
          format: "json",
          location: "US,AP,SA,EU,UK",
        },
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (response.data?.success) {
      const latencyObjects = response.data?.result?.serie_0;
      const latencies = Object.values(latencyObjects)?.slice(1).flat();
      return NextResponse.json({ latencies });
    }

    return NextResponse.json(
      { error: response.data?.errors ?? "Failed to fetch data" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error fetching Cloudflare data:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
