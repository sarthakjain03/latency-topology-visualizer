## About the Project

This Latency Topology Visualizer is a Next.js application that displays a 3D world map visualizing exchange server locations and real-time/historical latency data across AWS, GCP, and Azure co-location regions for cryptocurrency trading infrastructure.

## Features

- 3D World Map Display
- Exchange Server Locations
- Real-time Latency Visualization
- Historical Latency Trends
- Cloud Provider Regions
- Interactive Controls
- Responsive Design

## Technologies Used

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Query](https://tanstack.com/query/v4/docs/react/overview)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/overview/)
- [Recharts](https://recharts.org/)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/)
- [Turf.js] (https://turfjs.org/docs/getting-started)

## Steps to Setup and Run the Project Locally

First, clone the repository:

```bash
git clone https://github.com/sarthakjain/latency-topology-visualizer.git
```

Then, navigate to the project directory:

```bash
cd latency-topology-visualizer
```

Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Create a `.env` file in the project root directory and add the following content:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = YOUR_MAPBOX_PUBLIC_ACCESS_TOKEN
CLOUDFLARE_API_TOKEN = YOUR_CLOUDFLARE_API_TOKEN
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
