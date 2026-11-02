# AI-Powered Digital Twin of India's Climate
### *National Climate Intelligence & Adaptation Platform*

[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange.svg)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan.svg)](https://tailwindcss.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)

A high-performance, real-time national digital twin and climate intelligence system for the Indian subcontinent. The platform combines spatiotemporal AI modeling, satellite telemetry (ISRO INSAT-3D/3DR, ECMWF ERA5, IMD Gridded Data), high-fidelity D3 cartography, and interactive climate stress-testing simulations.

---

## 🌟 Key Features

### 1. High-Fidelity Political & Cartographic Explorer
* **Survey of India Standard Administrative Boundaries**: Seamless visualization of all 28 States and 8 Union Territories using standard TopoJSON definitions, including complete northern frontiers (Jammu & Kashmir, Ladakh) and eastern demarcations.
* **`d3-geo` Mercator Projection**: Mathematically scaled and centered projection tailored to India's bounding box (`[68.2°E, 6.7°N]` to `[97.4°E, 37.1°N]`).
* **`d3-zoom` Pan & Zoom Interactivity**: Fluid pan and zoom mechanics (`0.8x` to `14x`) with touch pinch, wheel scrolling, on-screen zoom buttons, and smooth animated focus on selected states.
* **Multi-Layer Thematic Overlays**:
  * **Political Layer**: Zonal coloring (North, South, East, West, Central, North-East, Islands) with state capitals and major metropolitan hubs.
  * **Thermal Heatmap**: Surface temperature gradients rendered using `d3.interpolateTurbo`.
  * **Climate Risk Radar**: Severity ranking (Low, Moderate, High, Severe) factoring heat stress, flood vulnerability, and cyclone exposure.
* **Theme Modes**: Toggle between high-tech **Cyber Dark** and clean **Atlas Political** palettes.

### 2. Spatiotemporal AI Forecasting & Digital Twin
* **ConvLSTM Deep Neural Models**: Spatiotemporal sequence-to-sequence neural network predictions for monsoon depressions, heat dome progressions, and western disturbances.
* **Ensemble Confidence Metrics**: Multi-model consensus tracking (RMSE, MAE, R² correlation) cross-validated with historical IMD grid points.
* **Nowcasting & Medium-Range Forecasting**: Sub-daily (3h, 6h, 12h) to seasonal (15-day, 30-day) climatic projections.

### 3. Scenario Simulator & Policy Stress Testing
* **Interactive What-If Modeling**: Simulate the impacts of:
  * Global warming trajectories (+1.5°C, +2.0°C, +3.0°C above pre-industrial levels)
  * Urban heat island escalation and land-use change
  * Forest cover reduction in Western Ghats and Himalayan foothills
  * Monsoon delay and aerosol cooling interventions
* **Socioeconomic Impact Matrix**: Real-time estimates for crop yield risk, groundwater depletion rates, cooling demand spikes, and vulnerable populations.

### 4. Interactive 3D Climate Observatory (Three.js PBR)
* **Physically-Based Rendering (PBR)**: Implemented using `ACESFilmicToneMapping`, `RoomEnvironment` with `PMREMGenerator`, warm directional key lighting + cool `HemisphereLight` bounce, and horizon-matched atmospheric fog (`FogExp2`).
* **Composite 3–12 Part Procedural Models**:
  * **ISRO INSAT-3DR Geostationary Climate Satellite**: 10-part procedural model assembling hexagonal titanium chassis, gold MLI thermal blanket, stepped optical sounder barrel, quartz lens, parabolic Earth antenna dish, feed horn tripod, articulated boom trusses, dual photovoltaic solar arrays, and RCS attitude thruster clusters.
  * **Ground Doppler Weather Radar Towers**: 7-part composite station with concrete hexagonal base, steel lattice mast, catwalk platform, geodesic radome, anemometer, and contact ground shadows.
* **Full-Bleed Viewport & Collapsible Bottom Dock**: Ergonomic floating control dock (`<= 15%` viewport footprint) with cinema mode toggle (`▾ Hide Controls`), camera view presets (Synoptic India, INSAT-3DR, Himalayas, Monsoon Front), and dynamic layer toggles.
* **Lossless 60fps Loop & Software-WebGL Guard**: Pre-allocated math scratchpads (`Vector3`, `Matrix4`, `Quaternion`) with exponential damping (`1 - Math.exp(-k * dt)`) and `afterDraw` software WebGL safety pacing.

### 5. Multi-Turn Gemini AI Climate Copilot
* **Server-Side Authenticated GenAI Proxy**: Powered by `@google/genai` (v2.32+) via Express `/api/chat` with telemetry header tracking.
* **Dynamic Model Selection**:
  * `gemini-3.8-flash`: General national climate intelligence and anomaly synthesis.
  * `gemini-3.1-flash-lite`: Low-latency, fast queries and real-time advisory.
  * `gemini-4-argon`: Complex deep reasoning for spatiotemporal mathematical modeling and long-range policy stress testing.
* **Role-Specific System Instructions**:
  * **Lead Climate Scientist**: Spatiotemporal ConvLSTM modeling and atmospheric physics.
  * **Disaster Resilience & Adaptation Strategist**: Action plans, district vulnerability, and NDMA protocols.
  * **Chief Operational Meteorologist**: Synoptic telemetry and ISRO INSAT-3DR sounding analysis.
* **Scrollable Thread & History**: Interactive conversation history with markdown formatting, prompt suggestions, and one-click copy.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) & [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Geospatial & Cartography** | [D3.js (d3-geo, d3-zoom)](https://d3js.org/), [topojson-client](https://github.com/topojson/topojson-client), [Leaflet](https://leafletjs.com/) |
| **Data Visualization** | [Recharts](https://recharts.org/), D3 color scales, Lucide React icons |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with custom cyber-cartography design system |
| **Data Sources** | Survey of India, India Meteorological Department (IMD), ISRO Bhuvan / MOSDAC, ECMWF ERA5 |

---

## 📂 Project Architecture

```
├── public/
│   └── india-states.topojson    # Survey of India administrative boundaries
├── src/
│   ├── components/
│   │   ├── maps/
│   │   │   └── IndiaPoliticalMap.tsx  # D3-Geo & D3-Zoom administrative map component
│   │   ├── ClimateMap.tsx             # Geospatial satellite & risk map
│   │   ├── Header.tsx                 # Navigation header & live alert bell
│   │   ├── Sidebar.tsx                # App module switcher
│   │   ├── AlertPanel.tsx             # Active extreme weather warning drawer
│   │   └── ApiModal.tsx               # Data feed & API documentation modal
│   ├── pages/
│   │   ├── PoliticalExplorerView.tsx  # Detailed political & regional demographic view
│   │   ├── DashboardView.tsx          # Real-time climate telemetry overview
│   │   ├── DigitalTwinView.tsx        # Neural digital twin forecast visualization
│   │   ├── ScenarioSimulatorView.tsx  # Climate policy & what-if stress tester
│   │   ├── ForecastView.tsx           # Multi-horizon precipitation & temperature forecast
│   │   ├── HistoricalTrendsView.tsx   # 50-year climate anomaly longitudinal analysis
│   │   ├── ClimateRiskView.tsx        # District-level vulnerability index
│   │   ├── ModelPerformanceView.tsx   # AI model validation & loss metrics
│   │   └── DataSourcesView.tsx        # Observational data pipeline provenance
│   ├── data/
│   │   ├── indiaTopoData.ts           # Bundled fallback TopoJSON topology
│   │   ├── indiaStatesMetadata.ts     # Metadata for all 36 States & UTs (coords, area, risks)
│   │   ├── regionsData.ts             # Macro-climatic zone parameters
│   │   └── historicalData.ts          # Longitudinal climate records
│   ├── types/
│   │   └── climate.ts                 # TypeScript domain schemas
│   ├── App.tsx                        # Master container and routing state
│   ├── main.tsx                       # React application entry point
│   └── index.css                      # Global Tailwind styles & font declarations
├── index.html                         # HTML entry with metadata and CDN assets
├── metadata.json                      # AI Studio application manifest
├── package.json                       # Dependencies and build scripts
├── tsconfig.json                      # TypeScript compiler configuration
└── vite.config.ts                     # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
* `npm` or `bun` package manager

### Installation
1. Clone or extract the repository:
   ```bash
   git clone <repository-url>
   cd react-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Available Scripts
* `npm run dev` — Launches Vite development server on port `3000`.
* `npm run build` — Compiles production-ready bundle into the `dist/` directory.
* `npm run lint` — Runs TypeScript compiler (`tsc --noEmit`) to validate type integrity.
* `npm run preview` — Locally preview the production build.

---

## 🗺️ Cartographic & Boundary Standards

The administrative boundaries presented in this platform adhere strictly to official **Survey of India** representations:
* Both **Jammu & Kashmir** and **Ladakh** are accurately depicted as separate Union Territories spanning the complete constitutional extent of India's northern frontier.
* **Arunachal Pradesh** and the Northeastern states are demarcated per official territorial definitions.
* Surrounding sovereign nations (Nepal, Bhutan, Bangladesh, Myanmar, Sri Lanka, Pakistan, China) and maritime bodies (Arabian Sea, Bay of Bengal, Indian Ocean) are labeled for cartographic orientation.

---

## 📄 License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
