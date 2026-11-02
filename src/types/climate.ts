export type ClimateVariable = 
  | 'rainfall' 
  | 'temp_max' 
  | 'temp_min' 
  | 'lst' 
  | 'sst' 
  | 'temp_anomaly' 
  | 'rainfall_anomaly' 
  | 'drought_risk' 
  | 'extreme_rainfall_risk';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';

export type DataTag = 'LIVE' | 'HISTORICAL' | 'MODELLED' | 'SIMULATED' | 'DEMO';

export interface RegionalClimateData {
  id: string;
  name: string;
  subdivision: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Islands';
  lat: number;
  lng: number;
  area_sqkm: number;
  current: {
    temp_current: number;
    temp_max: number;
    temp_min: number;
    temp_anomaly: number;
    rainfall_24h: number;
    rainfall_normal: number;
    rainfall_anomaly_pct: number;
    lst: number;
    sst?: number;
    soil_moisture_pct: number;
    relative_humidity_pct: number;
    wind_speed_kmh: number;
    wind_direction_deg: number;
    surface_pressure_hpa: number;
    updated_at: string;
  };
  risks: {
    overall_risk: RiskLevel;
    heat_risk: RiskLevel;
    flood_risk: RiskLevel;
    drought_risk: RiskLevel;
    water_stress: RiskLevel;
    agri_stress: RiskLevel;
  };
  forecast_7d: Array<{
    date: string;
    day_name: string;
    temp_max: number;
    temp_min: number;
    rainfall_mm: number;
    confidence_pct: number;
    upper_bound_temp: number;
    lower_bound_temp: number;
    upper_bound_rain: number;
    lower_bound_rain: number;
    condition: string;
  }>;
  coordinates_boundary: [number, number][];
}

export interface ScenarioInput {
  region_id: string;
  temp_delta: number; // -3 to +3 °C
  rain_delta_pct: number; // -30 to +30 %
  co2_ppm: number;
  monsoon_delay_days: number;
}

export interface ScenarioResult {
  region_name: string;
  baseline: {
    temp_max: number;
    temp_min: number;
    annual_rainfall_mm: number;
    crop_yield_index: number;
    water_reservoir_pct: number;
    heatwave_days_per_year: number;
  };
  simulated: {
    temp_max: number;
    temp_min: number;
    annual_rainfall_mm: number;
    crop_yield_index: number;
    water_reservoir_pct: number;
    heatwave_days_per_year: number;
  };
  risks: {
    heat_risk: RiskLevel;
    flood_risk: RiskLevel;
    drought_risk: RiskLevel;
    water_stress: RiskLevel;
    agri_stress: RiskLevel;
  };
  impact_summary: string[];
  adaptation_recommendations: string[];
}

export interface ModelMetric {
  variable: string;
  unit: string;
  mae: number;
  rmse: number;
  r2: number;
  correlation: number;
  bias: number;
  spatial_accuracy_pct: number;
  sample_size: string;
}

export interface ClimateDataSource {
  id: string;
  agency: 'IMD' | 'ISRO MOSDAC' | 'Bhuvan' | 'NICES' | 'INCOIS';
  title: string;
  parameter: string;
  spatial_resolution: string;
  temporal_resolution: string;
  coverage: string;
  format: string;
  latency: string;
  status: 'Operational' | 'Standby' | 'Simulated Feed';
  source_type: DataTag;
  description: string;
  api_endpoint: string;
}

export interface ExtremeEventAlert {
  id: string;
  title: string;
  type: 'Heavy Rainfall' | 'Heatwave' | 'Cyclonic Circulation' | 'Drought Stress' | 'Flash Flood';
  region: string;
  subdivision: string;
  severity: 'Warning' | 'Alert' | 'Watch' | 'Critical';
  metric_value: string;
  normal_value: string;
  timestamp: string;
  tag: DataTag;
  guidance: string;
}

export interface DigitalTwinState {
  timestamp: string;
  timeline_index: number; // -3 (historical 3d ago), 0 (now), +7 (forecast +7d)
  spheres: {
    atmosphere: {
      tropospheric_moisture_tcwv: number; // kg/m²
      monsoon_trough_intensity: string;
      jet_stream_wind_speed: number; // knots
      ghg_co2_ppm: number;
    };
    hydrosphere: {
      soil_water_storage_anomaly: number; // mm
      major_basins_storage_pct: number;
      groundwater_stress_index: number; // 0 - 100
    };
    ocean: {
      arabian_sea_sst_c: number;
      bay_of_bengal_sst_c: number;
      iod_index: number; // Indian Ocean Dipole
      enso_status: string;
    };
    cryosphere: {
      himalayan_snow_cover_km2: number;
      snow_cover_anomaly_pct: number;
      glacier_retreat_rate_m_yr: number;
    };
    biosphere: {
      ndvi_greenness_index: number; // 0 - 1
      kharif_crop_health_pct: number;
      forest_fire_vulnerability: RiskLevel;
    };
  };
}
