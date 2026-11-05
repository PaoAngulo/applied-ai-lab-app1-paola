export interface SalesOrder {
  id?: string;
  quarter: string; // 'Q1', 'Q2', 'Q3', 'Q4' (normalized)
  region: string;  // e.g., 'North', 'South', 'East', 'West'
  channel: string; // e.g., 'Direct', 'Online', 'Retail', 'Wholesale'
  product: string; // e.g., 'Enterprise Suite', 'Cloud Sync', 'Analytics Pro'
  units: number;
  discount_pct: number; // e.g., 12.5 (as a percentage 0-100) or 0.125
  revenue: number;
}

export type QuarterName = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface RegionQuarterRow {
  region: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  total: number;
  q2ToQ3DollarDelta: number;
  q2ToQ3PctDelta: number;
  q2ToQ3AbsDelta: number;
}

export interface ChannelContribution {
  name: string;
  q2Revenue: number;
  q3Revenue: number;
  delta: number;
  pctDelta: number;
}

export interface ProductContribution {
  name: string;
  q2Revenue: number;
  q3Revenue: number;
  delta: number;
  pctDelta: number;
}

export interface TopRegionDetailedMetrics {
  region: string;
  q2Revenue: number;
  q3Revenue: number;
  dollarDelta: number;
  absDollarDelta: number;
  pctDelta: number;
  q2Units: number;
  q3Units: number;
  unitsDelta: number;
  unitsPctDelta: number;
  q2AvgDiscountPct: number;
  q3AvgDiscountPct: number;
  discountDeltaPoints: number;
  q2RevPerUnit: number;
  q3RevPerUnit: number;
  revPerUnitDelta: number;
  channels: ChannelContribution[];
  topChannel: ChannelContribution | null;
  products: ProductContribution[];
  topProduct: ProductContribution | null;
}

export interface CalculatedSalesData {
  rows: SalesOrder[];
  regions: string[];
  quarters: QuarterName[];
  tableData: RegionQuarterRow[];
  totalByQuarter: Record<QuarterName, number>;
  grandTotal: number;
  q2ToQ3Ranking: {
    region: string;
    q2Revenue: number;
    q3Revenue: number;
    dollarDelta: number;
    absDollarDelta: number;
    pctDelta: number;
  }[];
  topChangedRegion: string;
  topRegionMetrics: TopRegionDetailedMetrics;
  allRegionsMetrics: Record<string, TopRegionDetailedMetrics>;
}

export interface AiSummaryResponse {
  summary: string;
  source: string;
  isAi: boolean;
  error?: string;
}
