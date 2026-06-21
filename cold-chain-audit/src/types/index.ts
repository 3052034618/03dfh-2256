export type TemperatureZone = 'frozen' | 'chilled' | 'ambient' | 'controlled';

export interface Customer {
  id: string;
  name: string;
}

export interface Carrier {
  id: string;
  name: string;
  licensePlate: string;
  driverName: string;
  phone: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  temperatureZone: TemperatureZone;
  minTemp: number;
  maxTemp: number;
}

export interface TemperaturePoint {
  timestamp: number;
  temperature: number;
  humidity?: number;
  status: 'normal' | 'over' | 'under' | 'missing';
}

export type RiskType = 
  | 'no_precooling'
  | 'unloading_wait'
  | 'data_gap'
  | 'over_temp'
  | 'under_temp'
  | 'door_open'
  | 'rapid_temp_change';

export interface RiskPoint {
  id: string;
  type: RiskType;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  temperatureRange?: { min: number; max: number };
  confirmed: boolean;
  isQualified: boolean | null;
  auditorNote: string;
}

export interface Waybill {
  id: string;
  waybillNo: string;
  customerId: string;
  customerName: string;
  carrierId: string;
  carrierName: string;
  routeId: string;
  routeName: string;
  productId: string;
  productName: string;
  temperatureZone: TemperatureZone;
  minTemp: number;
  maxTemp: number;
  shipmentDate: number;
  deliveryDate: number;
  actualDeliveryDate?: number;
  weightKg: number;
  quantity: number;
  temperatureData: TemperaturePoint[];
  riskPoints: RiskPoint[];
  reviewStatus: 'pending' | 'in_progress' | 'completed';
  finalResult: 'qualified' | 'unqualified' | null;
  auditor?: string;
  auditTime?: number;
  auditOpinion?: string;
  carrierExplanation?: string;
  hasDispute: boolean;
}

export interface CarrierScore {
  carrierId: string;
  carrierName: string;
  totalWaybills: number;
  overTempCount: number;
  overTempRate: number;
  explanationCompleteRate: number;
  disputeRate: number;
  avgResponseHours: number;
  qualifiedRate: number;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  periodStart: number;
  periodEnd: number;
}

export interface FilterParams {
  customerIds: string[];
  routeIds: string[];
  carrierIds: string[];
  temperatureZones: TemperatureZone[];
  dateRange: [number, number] | null;
  reviewStatus?: Waybill['reviewStatus'];
}

export const RISK_TYPE_LABELS: Record<RiskType, string> = {
  no_precooling: '起运前未预冷',
  unloading_wait: '卸货等待过长',
  data_gap: '途中连续缺点',
  over_temp: '温度超标（高）',
  under_temp: '温度超标（低）',
  door_open: '异常开门',
  rapid_temp_change: '温度骤变'
};

export const TEMPERATURE_ZONE_LABELS: Record<TemperatureZone, string> = {
  frozen: '冷冻 (-18°C以下)',
  chilled: '冷藏 (2-8°C)',
  ambient: '常温',
  controlled: '恒温 (15-25°C)'
};

export const REVIEW_STATUS_LABELS: Record<Waybill['reviewStatus'], string> = {
  pending: '待复核',
  in_progress: '复核中',
  completed: '已完成'
};

export const SEVERITY_LABELS: Record<RiskPoint['severity'], string> = {
  low: '轻微',
  medium: '中等',
  high: '严重'
};

export const GRADE_COLORS: Record<CarrierScore['grade'], string> = {
  S: '#52c41a',
  A: '#1890ff',
  B: '#faad14',
  C: '#fa8c16',
  D: '#f5222d'
};
