import { ExtremeEventAlert } from '../types/climate';

export interface HistoricalYearRecord {
  year: number;
  temp_anomaly_c: number;
  rainfall_monsoon_mm: number;
  rainfall_anomaly_pct: number;
  heatwave_days: number;
  extreme_rain_events_count: number;
  co2_ppm: number;
}

export const INDIA_HISTORICAL_TIMESERIES: HistoricalYearRecord[] = [
  { year: 1951, temp_anomaly_c: -0.24, rainfall_monsoon_mm: 790.2, rainfall_anomaly_pct: -10.9, heatwave_days: 8, extreme_rain_events_count: 52, co2_ppm: 310.8 },
  { year: 1955, temp_anomaly_c: -0.32, rainfall_monsoon_mm: 980.5, rainfall_anomaly_pct: 10.5, heatwave_days: 6, extreme_rain_events_count: 68, co2_ppm: 313.4 },
  { year: 1960, temp_anomaly_c: -0.18, rainfall_monsoon_mm: 885.0, rainfall_anomaly_pct: -0.2, heatwave_days: 9, extreme_rain_events_count: 61, co2_ppm: 316.9 },
  { year: 1965, temp_anomaly_c: -0.05, rainfall_monsoon_mm: 735.4, rainfall_anomaly_pct: -17.1, heatwave_days: 14, extreme_rain_events_count: 48, co2_ppm: 320.0 },
  { year: 1970, temp_anomaly_c: -0.15, rainfall_monsoon_mm: 982.0, rainfall_anomaly_pct: 10.7, heatwave_days: 7, extreme_rain_events_count: 72, co2_ppm: 325.7 },
  { year: 1975, temp_anomaly_c: -0.22, rainfall_monsoon_mm: 1020.1, rainfall_anomaly_pct: 15.0, heatwave_days: 5, extreme_rain_events_count: 85, co2_ppm: 331.1 },
  { year: 1980, temp_anomaly_c: 0.08, rainfall_monsoon_mm: 910.4, rainfall_anomaly_pct: 2.6, heatwave_days: 12, extreme_rain_events_count: 79, co2_ppm: 338.8 },
  { year: 1985, temp_anomaly_c: 0.12, rainfall_monsoon_mm: 820.6, rainfall_anomaly_pct: -7.5, heatwave_days: 15, extreme_rain_events_count: 84, co2_ppm: 346.1 },
  { year: 1990, temp_anomaly_c: 0.22, rainfall_monsoon_mm: 935.2, rainfall_anomaly_pct: 5.4, heatwave_days: 16, extreme_rain_events_count: 98, co2_ppm: 354.4 },
  { year: 1995, temp_anomaly_c: 0.28, rainfall_monsoon_mm: 880.0, rainfall_anomaly_pct: -0.8, heatwave_days: 19, extreme_rain_events_count: 105, co2_ppm: 360.8 },
  { year: 2000, temp_anomaly_c: 0.35, rainfall_monsoon_mm: 825.0, rainfall_anomaly_pct: -7.0, heatwave_days: 21, extreme_rain_events_count: 112, co2_ppm: 369.5 },
  { year: 2005, temp_anomaly_c: 0.44, rainfall_monsoon_mm: 875.4, rainfall_anomaly_pct: -1.3, heatwave_days: 24, extreme_rain_events_count: 135, co2_ppm: 379.8 },
  { year: 2010, temp_anomaly_c: 0.58, rainfall_monsoon_mm: 905.2, rainfall_anomaly_pct: 2.0, heatwave_days: 29, extreme_rain_events_count: 152, co2_ppm: 389.9 },
  { year: 2015, temp_anomaly_c: 0.67, rainfall_monsoon_mm: 760.8, rainfall_anomaly_pct: -14.2, heatwave_days: 35, extreme_rain_events_count: 168, co2_ppm: 400.8 },
  { year: 2018, temp_anomaly_c: 0.62, rainfall_monsoon_mm: 804.0, rainfall_anomaly_pct: -9.4, heatwave_days: 31, extreme_rain_events_count: 182, co2_ppm: 408.5 },
  { year: 2020, temp_anomaly_c: 0.65, rainfall_monsoon_mm: 958.0, rainfall_anomaly_pct: 8.0, heatwave_days: 32, extreme_rain_events_count: 195, co2_ppm: 414.2 },
  { year: 2022, temp_anomaly_c: 0.74, rainfall_monsoon_mm: 925.0, rainfall_anomaly_pct: 4.3, heatwave_days: 38, extreme_rain_events_count: 214, co2_ppm: 418.6 },
  { year: 2023, temp_anomaly_c: 0.82, rainfall_monsoon_mm: 820.0, rainfall_anomaly_pct: -5.6, heatwave_days: 41, extreme_rain_events_count: 228, co2_ppm: 421.1 },
  { year: 2024, temp_anomaly_c: 0.89, rainfall_monsoon_mm: 934.8, rainfall_anomaly_pct: 5.4, heatwave_days: 44, extreme_rain_events_count: 245, co2_ppm: 424.3 },
  { year: 2025, temp_anomaly_c: 0.94, rainfall_monsoon_mm: 912.4, rainfall_anomaly_pct: 2.8, heatwave_days: 47, extreme_rain_events_count: 260, co2_ppm: 427.0 },
  { year: 2026, temp_anomaly_c: 1.02, rainfall_monsoon_mm: 948.5, rainfall_anomaly_pct: 6.9, heatwave_days: 49, extreme_rain_events_count: 278, co2_ppm: 429.8 },
];

export const MONTHLY_CLIMATOLOGY = [
  { month: 'Jan', temp_mean: 18.2, temp_max: 24.8, temp_min: 11.6, rainfall: 17.5, lst: 21.4, sst: 26.2 },
  { month: 'Feb', temp_mean: 21.0, temp_max: 27.9, temp_min: 14.1, rainfall: 21.2, lst: 24.8, sst: 26.9 },
  { month: 'Mar', temp_mean: 25.8, temp_max: 32.6, temp_min: 19.0, rainfall: 30.5, lst: 30.2, sst: 28.1 },
  { month: 'Apr', temp_mean: 30.2, temp_max: 36.8, temp_min: 23.6, rainfall: 38.0, lst: 35.6, sst: 29.4 },
  { month: 'May', temp_mean: 32.8, temp_max: 39.2, temp_min: 26.4, rainfall: 62.4, lst: 39.8, sst: 30.2 },
  { month: 'Jun', temp_mean: 30.4, temp_max: 35.5, temp_min: 25.3, rainfall: 165.8, lst: 33.2, sst: 29.5 },
  { month: 'Jul', temp_mean: 28.2, temp_max: 32.0, temp_min: 24.4, rainfall: 280.4, lst: 29.5, sst: 28.6 },
  { month: 'Aug', temp_mean: 27.8, temp_max: 31.4, temp_min: 24.2, rainfall: 254.8, lst: 28.9, sst: 28.2 },
  { month: 'Sep', temp_mean: 27.6, temp_max: 31.8, temp_min: 23.4, rainfall: 172.5, lst: 29.8, sst: 28.5 },
  { month: 'Oct', temp_mean: 26.0, temp_max: 31.5, temp_min: 20.5, rainfall: 78.2, lst: 28.4, sst: 28.8 },
  { month: 'Nov', temp_mean: 22.4, temp_max: 28.4, temp_min: 16.4, rainfall: 28.6, lst: 24.6, sst: 28.0 },
  { month: 'Dec', temp_mean: 19.0, temp_max: 25.4, temp_min: 12.6, rainfall: 14.8, lst: 21.8, sst: 26.8 },
];

export const EXTREME_WEATHER_ALERTS: ExtremeEventAlert[] = [
  {
    id: 'alt-001',
    title: 'Extremely Heavy Monsoon Precipitation',
    type: 'Heavy Rainfall',
    region: 'Assam & NE',
    subdivision: 'Brahmaputra Valley & Meghalaya Escarpment',
    severity: 'Critical',
    metric_value: '142.6 mm / 24h',
    normal_value: '105.0 mm',
    timestamp: '2026-09-25 17:45 IST',
    tag: 'SIMULATED',
    guidance: 'IMD Red Alert: Risk of rapid riverine overflow in lower catchment. Flash flood protocol activated.',
  },
  {
    id: 'alt-002',
    title: 'Severe Surface Heat Anomaly & Desiccation',
    type: 'Heatwave',
    region: 'Rajasthan',
    subdivision: 'West Rajasthan Arid Zone',
    severity: 'Alert',
    metric_value: '41.2°C (+3.1°C)',
    normal_value: '38.1°C',
    timestamp: '2026-09-25 16:15 IST',
    tag: 'SIMULATED',
    guidance: 'IMD Orange Warning: High heat-stress index across Jaisalmer and Bikaner. Avoid peak midday exposure.',
  },
  {
    id: 'alt-003',
    title: 'Squally Monsoon Wind & Heavy Swell',
    type: 'Cyclonic Circulation',
    region: 'West Bengal & Odisha',
    subdivision: 'North Bay of Bengal Offshore',
    severity: 'Warning',
    metric_value: '55 km/h gusts | 108 mm',
    normal_value: '22 km/h | 85 mm',
    timestamp: '2026-09-25 15:30 IST',
    tag: 'SIMULATED',
    guidance: 'Coastal fishermen advised not to venture into deep sea. Coastal embankments on standby.',
  },
  {
    id: 'alt-004',
    title: 'Torrential Western Ghats Orographic Influx',
    type: 'Heavy Rainfall',
    region: 'Kerala',
    subdivision: 'High Ranges Idukki & Wayanad',
    severity: 'Alert',
    metric_value: '114.8 mm / 24h',
    normal_value: '82.0 mm',
    timestamp: '2026-09-25 14:00 IST',
    tag: 'SIMULATED',
    guidance: 'Landslide susceptibility elevated across slope sections >25°. Reservoir gates being regulated.',
  },
];
