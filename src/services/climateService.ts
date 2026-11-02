import { 
  RegionalClimateData, 
  ScenarioInput, 
  ScenarioResult, 
  DigitalTwinState, 
  ClimateDataSource, 
  ModelMetric, 
  RiskLevel 
} from '../types/climate';
import { INDIAN_REGIONS } from '../data/regionsData';
import { INDIA_HISTORICAL_TIMESERIES, MONTHLY_CLIMATOLOGY, EXTREME_WEATHER_ALERTS } from '../data/historicalData';
import { NATIONAL_DATA_SOURCES, MODEL_METRICS_DATA } from '../data/dataSources';

/**
 * Climate Service - Implements functional client-side REST simulation
 * matching the specifications for the India Climate Digital Twin platform.
 * 
 * Supports both standalone execution and direct routing for backend PoC.
 */
class ClimateService {
  private regions: RegionalClimateData[] = INDIAN_REGIONS;

  // GET /api/climate/regions
  public async getRegions(): Promise<RegionalClimateData[]> {
    return this.regions;
  }

  // GET /api/climate/current?region=karnataka
  public async getCurrent(regionId?: string): Promise<RegionalClimateData | RegionalClimateData[]> {
    if (regionId) {
      const match = this.regions.find(r => r.id.toLowerCase() === regionId.toLowerCase());
      if (match) return match;
    }
    return this.regions;
  }

  // GET /api/climate/forecast?region=karnataka&days=7
  public async getForecast(regionId: string, days: number = 7) {
    const region = this.regions.find(r => r.id.toLowerCase() === regionId.toLowerCase()) || this.regions[0];
    return {
      region_id: region.id,
      region_name: region.name,
      variable_horizons: region.forecast_7d.slice(0, days),
      model: 'ConvLSTM-Thermodynamic-Ensemble-v3.2',
      confidence_mean: Math.round(
        region.forecast_7d.slice(0, days).reduce((acc, curr) => acc + curr.confidence_pct, 0) / days
      ),
      generated_at: '2026-09-25 18:30 IST',
      tag: 'MODELLED'
    };
  }

  // GET /api/climate/historical
  public async getHistorical(startYear: number = 1951, endYear: number = 2026) {
    return {
      timeseries: INDIA_HISTORICAL_TIMESERIES.filter(d => d.year >= startYear && d.year <= endYear),
      climatology: MONTHLY_CLIMATOLOGY,
      base_period: '1971-2000 IMD Climatological Normal Baseline',
      tag: 'HISTORICAL'
    };
  }

  // GET /api/digital-twin/state?timeline_offset=0
  public async getDigitalTwinState(timelineOffset: number = 0): Promise<DigitalTwinState> {
    // Dynamic physics calculation based on timeline slider (-3 days to +7 days)
    const baseAtmosphere = 48.5 + (timelineOffset * 0.4);
    const baseArabianSst = 28.9 + (timelineOffset * 0.05);
    const baseBaySst = 29.5 + (timelineOffset * 0.06);

    let statusEnso = 'Neutral / Weak La Niña Tendency';
    if (timelineOffset > 3) statusEnso = 'Active Monsoon Convective Surge Predicted';

    return {
      timestamp: timelineOffset === 0 
        ? '2026-09-25 18:30 IST [REAL-TIME]' 
        : timelineOffset > 0 
          ? `2026-09-${25 + timelineOffset} 12:00 IST [CONVLSTM FORECAST +${timelineOffset}d]` 
          : `2026-09-${25 + timelineOffset} 12:00 IST [HISTORICAL ASSIMILATION ${timelineOffset}d]`,
      timeline_index: timelineOffset,
      spheres: {
        atmosphere: {
          tropospheric_moisture_tcwv: Number(baseAtmosphere.toFixed(1)),
          monsoon_trough_intensity: timelineOffset > 2 ? 'Oscillating Northwards (Active)' : 'Normal South-Central Trajectory',
          jet_stream_wind_speed: Math.round(92 + (timelineOffset * 1.5)),
          ghg_co2_ppm: 429.8,
        },
        hydrosphere: {
          soil_water_storage_anomaly: Number((12.4 + (timelineOffset * 1.1)).toFixed(1)),
          major_basins_storage_pct: Math.min(100, Math.round(78 + (timelineOffset * 0.8))),
          groundwater_stress_index: 44,
        },
        ocean: {
          arabian_sea_sst_c: Number(baseArabianSst.toFixed(2)),
          bay_of_bengal_sst_c: Number(baseBaySst.toFixed(2)),
          iod_index: 0.28,
          enso_status: statusEnso,
        },
        cryosphere: {
          himalayan_snow_cover_km2: 124500 - (timelineOffset * 40),
          snow_cover_anomaly_pct: -4.2,
          glacier_retreat_rate_m_yr: 14.8,
        },
        biosphere: {
          ndvi_greenness_index: Number((0.68 + (timelineOffset * 0.005)).toFixed(3)),
          kharif_crop_health_pct: Math.max(50, Math.min(98, 86 - (timelineOffset < 0 ? 0 : timelineOffset * 0.5))),
          forest_fire_vulnerability: timelineOffset > 4 ? 'Moderate' : 'Low',
        }
      }
    };
  }

  // POST /api/scenario/simulate
  public async simulateScenario(input: ScenarioInput): Promise<ScenarioResult> {
    const region = this.regions.find(r => r.id === input.region_id) || this.regions[0];
    
    // Baseline calculations
    const baseRain = Math.round(region.current.rainfall_normal * 12); // annual proxy
    const baseTmax = region.current.temp_max;
    const baseTmin = region.current.temp_min;
    
    // Apply perturbations
    const simTmax = Number((baseTmax + input.temp_delta).toFixed(1));
    const simTmin = Number((baseTmin + (input.temp_delta * 0.8)).toFixed(1));
    const simRain = Math.round(baseRain * (1 + input.rain_delta_pct / 100));

    // Biophysical and hydrological responses
    // Heat stress increases non-linearly with temperature delta
    const heatRiskScore = Math.max(0, Math.min(100, 40 + (input.temp_delta * 18)));
    const droughtRiskScore = Math.max(0, Math.min(100, 35 - (input.rain_delta_pct * 1.5) + (input.temp_delta * 8)));
    const floodRiskScore = Math.max(0, Math.min(100, 30 + (input.rain_delta_pct * 2.2)));
    const waterStressScore = Math.max(0, Math.min(100, 45 - (input.rain_delta_pct * 1.2) + (input.temp_delta * 10)));
    const agriStressScore = Math.max(0, Math.min(100, 35 + (Math.abs(input.temp_delta) * 12) + (input.rain_delta_pct < 0 ? Math.abs(input.rain_delta_pct) * 1.6 : 0)));

    const getLevel = (score: number): RiskLevel => {
      if (score >= 75) return 'Severe';
      if (score >= 60) return 'High';
      if (score >= 40) return 'Moderate';
      return 'Low';
    };

    const simulatedReservoir = Math.max(10, Math.min(100, Math.round(75 + (input.rain_delta_pct * 0.7) - (input.temp_delta * 5))));
    const cropYieldIndex = Math.max(40, Math.min(130, Math.round(100 - (input.temp_delta * 7) + (input.rain_delta_pct * 0.4))));
    const heatwaveDays = Math.max(5, Math.round(20 + (input.temp_delta * 12)));

    // Generate intelligent impact summary
    const impact_summary: string[] = [];
    if (input.temp_delta > 1.5) {
      impact_summary.push(`Extreme thermal stress: Heatwave durations in ${region.name} extend by +${Math.round(input.temp_delta * 12)} days annually.`);
    } else if (input.temp_delta < -1.0) {
      impact_summary.push(`Cooling anomaly preserves high-altitude snowpack but could retard seed germination in early Kharif.`);
    }

    if (input.rain_delta_pct <= -15) {
      impact_summary.push(`Deficit monsoon scenario: Irrigation reservoir storage projected to decrease to ${simulatedReservoir}%, precipitating agricultural drought.`);
    } else if (input.rain_delta_pct >= 15) {
      impact_summary.push(`Surplus precipitation scenario: Runoff volumes surge by +${Math.round(input.rain_delta_pct * 1.4)}%, elevating flash-flood frequency along riverine plains.`);
    } else {
      impact_summary.push(`Precipitation remains within buffered normal climatological envelope (±15%).`);
    }

    impact_summary.push(`Crop Yield Index shifts to ${cropYieldIndex}% of historical baseline with current cropping patterns.`);

    const adaptation_recommendations: string[] = [
      input.temp_delta > 1.0 ? 'Promote heat-tolerant cereal cultivars (e.g. ICRISAT dryland pearl millet).' : 'Maintain standard thermal cultivar zoning.',
      input.rain_delta_pct < 0 ? 'Implement micro-drip fertigation & mandatory check-dam recharge mandates.' : 'Fortify drainage canals and upgrade flood warning telemetry in vulnerable catchments.',
      'Deploy localized weather index-based crop insurance (PMFBY) recalibrated for shifted peak thresholds.'
    ];

    return {
      region_name: region.name,
      baseline: {
        temp_max: baseTmax,
        temp_min: baseTmin,
        annual_rainfall_mm: baseRain,
        crop_yield_index: 100,
        water_reservoir_pct: 75,
        heatwave_days_per_year: 20,
      },
      simulated: {
        temp_max: simTmax,
        temp_min: simTmin,
        annual_rainfall_mm: simRain,
        crop_yield_index: cropYieldIndex,
        water_reservoir_pct: simulatedReservoir,
        heatwave_days_per_year: heatwaveDays,
      },
      risks: {
        heat_risk: getLevel(heatRiskScore),
        flood_risk: getLevel(floodRiskScore),
        drought_risk: getLevel(droughtRiskScore),
        water_stress: getLevel(waterStressScore),
        agri_stress: getLevel(agriStressScore),
      },
      impact_summary,
      adaptation_recommendations
    };
  }

  // GET /api/model/performance
  public async getModelPerformance(): Promise<ModelMetric[]> {
    return MODEL_METRICS_DATA;
  }

  // GET /api/data/sources
  public async getDataSources(): Promise<ClimateDataSource[]> {
    return NATIONAL_DATA_SOURCES;
  }

  // GET /api/extreme-events
  public async getExtremeEvents() {
    return EXTREME_WEATHER_ALERTS;
  }
}

export const climateService = new ClimateService();
