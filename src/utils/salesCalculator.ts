import {
  CalculatedSalesData,
  ChannelContribution,
  ProductContribution,
  QuarterName,
  RegionQuarterRow,
  SalesOrder,
  TopRegionDetailedMetrics,
} from '../types/sales';

const QUARTERS: QuarterName[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function calculateSalesMetrics(orders: SalesOrder[]): CalculatedSalesData | null {
  if (!orders || orders.length === 0) return null;

  // Extract unique regions
  const regionsSet = new Set<string>();
  orders.forEach((o) => {
    if (o.region) regionsSet.add(o.region);
  });
  const regions = Array.from(regionsSet).sort();

  // Aggregate revenue by region and quarter
  // matrix: [region][quarter] -> sum(revenue)
  const matrix: Record<string, Record<QuarterName, number>> = {};
  regions.forEach((r) => {
    matrix[r] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  });

  const totalByQuarter: Record<QuarterName, number> = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
  };

  let grandTotal = 0;

  orders.forEach((o) => {
    const q = o.quarter as QuarterName;
    if (QUARTERS.includes(q) && matrix[o.region]) {
      matrix[o.region][q] += o.revenue;
      totalByQuarter[q] += o.revenue;
      grandTotal += o.revenue;
    }
  });

  // Table rows with Q2 -> Q3 deltas
  const tableData: RegionQuarterRow[] = regions.map((region) => {
    const q1 = matrix[region].Q1;
    const q2 = matrix[region].Q2;
    const q3 = matrix[region].Q3;
    const q4 = matrix[region].Q4;
    const total = q1 + q2 + q3 + q4;

    const q2ToQ3DollarDelta = q3 - q2;
    const q2ToQ3AbsDelta = Math.abs(q2ToQ3DollarDelta);
    const q2ToQ3PctDelta = q2 > 0 ? ((q3 - q2) / q2) * 100 : q3 > 0 ? 100 : 0;

    return {
      region,
      q1,
      q2,
      q3,
      q4,
      total,
      q2ToQ3DollarDelta,
      q2ToQ3PctDelta,
      q2ToQ3AbsDelta,
    };
  });

  // Sort Q2->Q3 shifts to find region that changed most
  // Standard financial definition: largest absolute dollar change |Q3 - Q2|
  const q2ToQ3Ranking = [...tableData]
    .map((r) => ({
      region: r.region,
      q2Revenue: r.q2,
      q3Revenue: r.q3,
      dollarDelta: r.q2ToQ3DollarDelta,
      absDollarDelta: r.q2ToQ3AbsDelta,
      pctDelta: r.q2ToQ3PctDelta,
    }))
    .sort((a, b) => b.absDollarDelta - a.absDollarDelta);

  const topChangedRegion = q2ToQ3Ranking.length > 0 ? q2ToQ3Ranking[0].region : (regions[0] || 'Unknown');

  // Compute detailed drivers for all regions and especially the top changed region
  const allRegionsMetrics: Record<string, TopRegionDetailedMetrics> = {};

  regions.forEach((reg) => {
    const regOrders = orders.filter((o) => o.region === reg);
    const q2Orders = regOrders.filter((o) => o.quarter === 'Q2');
    const q3Orders = regOrders.filter((o) => o.quarter === 'Q3');

    const q2Revenue = matrix[reg].Q2;
    const q3Revenue = matrix[reg].Q3;
    const dollarDelta = q3Revenue - q2Revenue;
    const absDollarDelta = Math.abs(dollarDelta);
    const pctDelta = q2Revenue > 0 ? (dollarDelta / q2Revenue) * 100 : q3Revenue > 0 ? 100 : 0;

    const q2Units = q2Orders.reduce((sum, o) => sum + o.units, 0);
    const q3Units = q3Orders.reduce((sum, o) => sum + o.units, 0);
    const unitsDelta = q3Units - q2Units;
    const unitsPctDelta = q2Units > 0 ? (unitsDelta / q2Units) * 100 : q3Units > 0 ? 100 : 0;

    // Weighted average discount % by revenue (or order units if revenue is 0)
    const computeAvgDiscount = (ordersList: SalesOrder[], totalRev: number): number => {
      if (ordersList.length === 0) return 0;
      if (totalRev > 0) {
        const weighted = ordersList.reduce((acc, o) => acc + o.discount_pct * o.revenue, 0);
        return weighted / totalRev;
      }
      const sum = ordersList.reduce((acc, o) => acc + o.discount_pct, 0);
      return sum / ordersList.length;
    };

    const q2AvgDiscountPct = computeAvgDiscount(q2Orders, q2Revenue);
    const q3AvgDiscountPct = computeAvgDiscount(q3Orders, q3Revenue);
    const discountDeltaPoints = q3AvgDiscountPct - q2AvgDiscountPct;

    const q2RevPerUnit = q2Units > 0 ? q2Revenue / q2Units : 0;
    const q3RevPerUnit = q3Units > 0 ? q3Revenue / q3Units : 0;
    const revPerUnitDelta = q3RevPerUnit - q2RevPerUnit;

    // Channel breakdown
    const channelsSet = new Set<string>([...q2Orders.map((o) => o.channel), ...q3Orders.map((o) => o.channel)]);
    const channels: ChannelContribution[] = Array.from(channelsSet).map((ch) => {
      const q2ChRev = q2Orders.filter((o) => o.channel === ch).reduce((s, o) => s + o.revenue, 0);
      const q3ChRev = q3Orders.filter((o) => o.channel === ch).reduce((s, o) => s + o.revenue, 0);
      const delta = q3ChRev - q2ChRev;
      const pctDelta = q2ChRev > 0 ? (delta / q2ChRev) * 100 : q3ChRev > 0 ? 100 : 0;
      return {
        name: ch,
        q2Revenue: q2ChRev,
        q3Revenue: q3ChRev,
        delta,
        pctDelta,
      };
    }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const topChannel = channels.length > 0 ? channels[0] : null;

    // Product breakdown
    const productsSet = new Set<string>([...q2Orders.map((o) => o.product), ...q3Orders.map((o) => o.product)]);
    const products: ProductContribution[] = Array.from(productsSet).map((p) => {
      const q2PRev = q2Orders.filter((o) => o.product === p).reduce((s, o) => s + o.revenue, 0);
      const q3PRev = q3Orders.filter((o) => o.product === p).reduce((s, o) => s + o.revenue, 0);
      const delta = q3PRev - q2PRev;
      const pctDelta = q2PRev > 0 ? (delta / q2PRev) * 100 : q3PRev > 0 ? 100 : 0;
      return {
        name: p,
        q2Revenue: q2PRev,
        q3Revenue: q3PRev,
        delta,
        pctDelta,
      };
    }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const topProduct = products.length > 0 ? products[0] : null;

    allRegionsMetrics[reg] = {
      region: reg,
      q2Revenue,
      q3Revenue,
      dollarDelta,
      absDollarDelta,
      pctDelta,
      q2Units,
      q3Units,
      unitsDelta,
      unitsPctDelta,
      q2AvgDiscountPct,
      q3AvgDiscountPct,
      discountDeltaPoints,
      q2RevPerUnit,
      q3RevPerUnit,
      revPerUnitDelta,
      channels,
      topChannel,
      products,
      topProduct,
    };
  });

  const topRegionMetrics = allRegionsMetrics[topChangedRegion] || {
    region: topChangedRegion,
    q2Revenue: 0,
    q3Revenue: 0,
    dollarDelta: 0,
    absDollarDelta: 0,
    pctDelta: 0,
    q2Units: 0,
    q3Units: 0,
    unitsDelta: 0,
    unitsPctDelta: 0,
    q2AvgDiscountPct: 0,
    q3AvgDiscountPct: 0,
    discountDeltaPoints: 0,
    q2RevPerUnit: 0,
    q3RevPerUnit: 0,
    revPerUnitDelta: 0,
    channels: [],
    topChannel: null,
    products: [],
    topProduct: null,
  };

  return {
    rows: orders,
    regions,
    quarters: QUARTERS,
    tableData,
    totalByQuarter,
    grandTotal,
    q2ToQ3Ranking,
    topChangedRegion,
    topRegionMetrics,
    allRegionsMetrics,
  };
}

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(abs);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}
