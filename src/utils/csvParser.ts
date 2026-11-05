import { SalesOrder } from '../types/sales';

/**
 * Splits a single CSV line respecting quotes
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalizes quarter string to 'Q1', 'Q2', 'Q3', or 'Q4'
 */
export function normalizeQuarter(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^Q0-9]/g, '');
  if (cleaned.includes('Q1') || cleaned === '1') return 'Q1';
  if (cleaned.includes('Q2') || cleaned === '2') return 'Q2';
  if (cleaned.includes('Q3') || cleaned === '3') return 'Q3';
  if (cleaned.includes('Q4') || cleaned === '4') return 'Q4';

  const match = raw.toUpperCase().match(/Q[1-4]/);
  if (match) return match[0];
  return raw.trim() || 'Q1';
}

/**
 * Cleans numerical strings (e.g. "$12,450.50", "15%")
 */
export function cleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/[\$,]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Cleans discount percentage. If provided as e.g. 0.15, convert to 15%. If "15%", parse to 15.
 */
export function cleanDiscountPct(val: any): number {
  if (typeof val === 'number') {
    return val <= 1 && val > 0 ? val * 100 : val;
  }
  if (!val) return 0;
  const str = String(val).replace(/[\$,%]/g, '').trim();
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  // If user passed 0.15 instead of 15, normalize to 15%
  if (num > 0 && num < 1) {
    return num * 100;
  }
  return num;
}

export interface ParseResult {
  orders: SalesOrder[];
  errors: string[];
  totalRowsParsed: number;
  detectedColumns: Record<string, string>;
}

export function parseSalesCsv(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];

  if (lines.length < 2) {
    return {
      orders: [],
      errors: ['The CSV file is empty or does not contain data rows.'],
      totalRowsParsed: 0,
      detectedColumns: {},
    };
  }

  const rawHeaders = splitCsvLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  // Header matching helpers
  const findCol = (keywords: string[]): number => {
    return rawHeaders.findIndex((h) => keywords.some((kw) => h === kw || h.includes(kw)));
  };

  const quarterIdx = findCol(['quarter', 'qtr', 'period']);
  const regionIdx = findCol(['region', 'territory', 'area', 'zone']);
  const channelIdx = findCol(['channel', 'sales_channel', 'distribution']);
  const productIdx = findCol(['product', 'item', 'sku', 'product_name']);
  const unitsIdx = findCol(['units', 'qty', 'quantity', 'units_sold']);
  const discountIdx = findCol(['discount_pct', 'discount', 'disc', 'pct_discount']);
  const revenueIdx = findCol(['revenue', 'sales', 'amount', 'total_revenue']);

  const detectedColumns: Record<string, string> = {
    quarter: quarterIdx >= 0 ? rawHeaders[quarterIdx] : 'NOT FOUND',
    region: regionIdx >= 0 ? rawHeaders[regionIdx] : 'NOT FOUND',
    channel: channelIdx >= 0 ? rawHeaders[channelIdx] : 'NOT FOUND',
    product: productIdx >= 0 ? rawHeaders[productIdx] : 'NOT FOUND',
    units: unitsIdx >= 0 ? rawHeaders[unitsIdx] : 'NOT FOUND',
    discount_pct: discountIdx >= 0 ? rawHeaders[discountIdx] : 'NOT FOUND',
    revenue: revenueIdx >= 0 ? rawHeaders[revenueIdx] : 'NOT FOUND',
  };

  // If critical columns missing
  const missing = [];
  if (quarterIdx === -1) missing.push('quarter');
  if (regionIdx === -1) missing.push('region');
  if (revenueIdx === -1) missing.push('revenue');

  if (missing.length > 0) {
    errors.push(`Missing mandatory column(s): ${missing.join(', ')}. Found: ${rawHeaders.join(', ')}`);
  }

  const orders: SalesOrder[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = splitCsvLine(rawLine);
    if (cols.length < 2) continue; // skip blank/corrupt

    const quarterRaw = quarterIdx >= 0 ? cols[quarterIdx] : 'Q1';
    const regionRaw = regionIdx >= 0 ? cols[regionIdx] : 'Global';
    const channelRaw = channelIdx >= 0 ? cols[channelIdx] : 'Direct';
    const productRaw = productIdx >= 0 ? cols[productIdx] : 'General';
    const unitsRaw = unitsIdx >= 0 ? cols[unitsIdx] : '1';
    const discountRaw = discountIdx >= 0 ? cols[discountIdx] : '0';
    const revenueRaw = revenueIdx >= 0 ? cols[revenueIdx] : '0';

    const quarter = normalizeQuarter(quarterRaw);
    const region = (regionRaw || 'Unknown').replace(/^["']|["']$/g, '').trim();
    const channel = (channelRaw || 'Direct').replace(/^["']|["']$/g, '').trim();
    const product = (productRaw || 'Product').replace(/^["']|["']$/g, '').trim();
    const units = Math.max(0, Math.round(cleanNumber(unitsRaw)));
    const discount_pct = cleanDiscountPct(discountRaw);
    const revenue = cleanNumber(revenueRaw);

    if (region) {
      orders.push({
        id: `row-${i}`,
        quarter,
        region,
        channel,
        product,
        units: units || 1,
        discount_pct,
        revenue,
      });
    }
  }

  return {
    orders,
    errors,
    totalRowsParsed: orders.length,
    detectedColumns,
  };
}

/**
 * Sample dataset generator with realistic quarterly regional sales patterns
 * Region "West" will have the highest change from Q2 to Q3 (+ $184,500, +48.3%)
 * driven by high unit surge in Online channel and Enterprise Cloud product, with discounts dropping.
 */
export function generateSampleCsvContent(): string {
  return `quarter,region,channel,product,units,discount_pct,revenue
Q1,North,Direct,Enterprise Cloud,45,8.0,45000
Q1,North,Online,Analytics Pro,120,5.0,24000
Q1,North,Retail,Hardware Hub,80,12.0,16000
Q1,South,Direct,Enterprise Cloud,30,10.0,30000
Q1,South,Wholesale,Hardware Hub,150,15.0,22500
Q1,East,Direct,Enterprise Cloud,60,7.0,60000
Q1,East,Online,Analytics Pro,200,6.0,40000
Q1,East,Partner,Data Pipeline,95,10.0,28500
Q1,West,Direct,Enterprise Cloud,50,9.0,50000
Q1,West,Online,Analytics Pro,160,8.0,32000
Q1,West,Retail,Hardware Hub,110,14.0,22000
Q2,North,Direct,Enterprise Cloud,52,8.5,52000
Q2,North,Online,Analytics Pro,135,6.0,27000
Q2,North,Retail,Hardware Hub,85,12.0,17000
Q2,South,Direct,Enterprise Cloud,34,9.5,34000
Q2,South,Wholesale,Hardware Hub,165,14.0,24750
Q2,South,Online,Analytics Pro,110,8.0,22000
Q2,East,Direct,Enterprise Cloud,65,7.0,65000
Q2,East,Online,Analytics Pro,210,5.5,42000
Q2,East,Partner,Data Pipeline,105,9.0,31500
Q2,West,Direct,Enterprise Cloud,55,9.0,55000
Q2,West,Online,Analytics Pro,180,8.5,36000
Q2,West,Retail,Hardware Hub,125,13.0,25000
Q3,North,Direct,Enterprise Cloud,58,8.0,58000
Q3,North,Online,Analytics Pro,145,5.0,29000
Q3,North,Retail,Hardware Hub,90,11.5,18000
Q3,South,Direct,Enterprise Cloud,38,9.0,38000
Q3,South,Wholesale,Hardware Hub,175,13.5,26250
Q3,South,Online,Analytics Pro,125,7.5,25000
Q3,East,Direct,Enterprise Cloud,72,6.5,72000
Q3,East,Online,Analytics Pro,230,5.0,46000
Q3,East,Partner,Data Pipeline,115,8.5,34500
Q3,West,Direct,Enterprise Cloud,110,6.0,110000
Q3,West,Online,Analytics Pro,450,4.0,90000
Q3,West,Retail,Hardware Hub,140,10.0,28000
Q3,West,Partner,Data Pipeline,180,5.0,72500
Q4,North,Direct,Enterprise Cloud,62,8.0,62000
Q4,North,Online,Analytics Pro,155,5.0,31000
Q4,North,Retail,Hardware Hub,95,11.0,19000
Q4,South,Direct,Enterprise Cloud,42,8.5,42000
Q4,South,Wholesale,Hardware Hub,190,13.0,28500
Q4,South,Online,Analytics Pro,140,7.0,28000
Q4,East,Direct,Enterprise Cloud,80,6.0,80000
Q4,East,Online,Analytics Pro,250,5.0,50000
Q4,East,Partner,Data Pipeline,130,8.0,39000
Q4,West,Direct,Enterprise Cloud,125,5.5,125000
Q4,West,Online,Analytics Pro,480,4.0,96000
Q4,West,Retail,Hardware Hub,150,9.5,30000
Q4,West,Partner,Data Pipeline,195,5.0,78000`;
}
