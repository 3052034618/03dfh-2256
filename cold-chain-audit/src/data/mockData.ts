import dayjs from 'dayjs';
import type { Customer, Carrier, Route, Product, Waybill, TemperaturePoint, RiskPoint, CarrierScore, TemperatureZone, RiskType } from '../types';

const CUSTOMERS: Customer[] = [
  { id: 'c1', name: '华润医药商业集团' },
  { id: 'c2', name: '国药控股物流中心' },
  { id: 'c3', name: '上海医药股份' },
  { id: 'c4', name: '蒙牛乳业低温事业部' },
  { id: 'c5', name: '伊利股份冷链分公司' },
  { id: 'c6', name: '三全食品股份' },
  { id: 'c7', name: '思念食品冷链' },
  { id: 'c8', name: '京东健康医药仓' },
];

const CARRIERS: Carrier[] = [
  { id: 'car1', name: '顺丰冷运', licensePlate: '京A·88621', driverName: '张建国', phone: '13800138001' },
  { id: 'car2', name: '京东冷链', licensePlate: '京B·37219', driverName: '李志强', phone: '13800138002' },
  { id: 'car3', name: '圆通冷链', licensePlate: '沪C·91827', driverName: '王海涛', phone: '13800138003' },
  { id: 'car4', name: '中通冷链', licensePlate: '粤A·55667', driverName: '赵明辉', phone: '13800138004' },
  { id: 'car5', name: '荣庆物流', licensePlate: '鲁A·33445', driverName: '孙立伟', phone: '13800138005' },
  { id: 'car6', name: '中冷物流', licensePlate: '苏A·11223', driverName: '周大鹏', phone: '13800138006' },
];

const ROUTES: Route[] = [
  { id: 'r1', name: '北京-上海', origin: '北京大兴', destination: '上海青浦', distanceKm: 1318 },
  { id: 'r2', name: '北京-广州', origin: '北京通州', destination: '广州白云', distanceKm: 2120 },
  { id: 'r3', name: '上海-杭州', origin: '上海青浦', destination: '杭州余杭', distanceKm: 176 },
  { id: 'r4', name: '广州-深圳', origin: '广州白云', destination: '深圳宝安', distanceKm: 135 },
  { id: 'r5', name: '北京-天津', origin: '北京大兴', destination: '天津港保税', distanceKm: 120 },
  { id: 'r6', name: '上海-南京', origin: '上海青浦', destination: '南京江宁', distanceKm: 301 },
  { id: 'r7', name: '广州-武汉', origin: '广州白云', destination: '武汉东西湖', distanceKm: 1023 },
  { id: 'r8', name: '成都-重庆', origin: '成都新都', destination: '重庆渝北', distanceKm: 308 },
];

const PRODUCTS: Product[] = [
  { id: 'p1', name: '重组人胰岛素注射液', sku: 'INS-001', temperatureZone: 'chilled', minTemp: 2, maxTemp: 8 },
  { id: 'p2', name: '新冠灭活疫苗', sku: 'VAC-002', temperatureZone: 'chilled', minTemp: 2, maxTemp: 8 },
  { id: 'p3', name: '低温存储试剂盒', sku: 'KIT-003', temperatureZone: 'frozen', minTemp: -25, maxTemp: -15 },
  { id: 'p4', name: '全脂巴氏杀菌乳', sku: 'MLK-004', temperatureZone: 'chilled', minTemp: 2, maxTemp: 6 },
  { id: 'p5', name: '速冻水饺三鲜馅', sku: 'DMP-005', temperatureZone: 'frozen', minTemp: -20, maxTemp: -12 },
  { id: 'p6', name: '发酵酸奶原味', sku: 'YGT-006', temperatureZone: 'chilled', minTemp: 2, maxTemp: 10 },
  { id: 'p7', name: '冷链专用试剂', sku: 'REG-007', temperatureZone: 'controlled', minTemp: 15, maxTemp: 25 },
  { id: 'p8', name: '冰激凌香草味', sku: 'ICM-008', temperatureZone: 'frozen', minTemp: -22, maxTemp: -16 },
];

function randomId() {
  return Math.random().toString(36).substring(2, 11);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateTemperatureData(
  minTemp: number,
  maxTemp: number,
  startTime: number,
  durationHours: number,
  hasIssues: boolean
): TemperaturePoint[] {
  const points: TemperaturePoint[] = [];
  const intervalMs = 5 * 60 * 1000;
  const totalPoints = Math.floor((durationHours * 60 * 60 * 1000) / intervalMs);

  let preCoolingDone = false;
  let currentTemp = randomInRange(18, 25);

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = startTime + i * intervalMs;
    const hoursElapsed = (i * intervalMs) / (1000 * 60 * 60);
    let temp: number;
    let status: TemperaturePoint['status'] = 'normal';

    if (hoursElapsed < 1.5) {
      if (!preCoolingDone && hasIssues && Math.random() > 0.5) {
        temp = currentTemp - randomInRange(0.1, 0.3);
        if (temp <= maxTemp + 3) {
          preCoolingDone = true;
        }
      } else {
        temp = Math.max(
          randomInRange(minTemp, maxTemp),
          currentTemp - randomInRange(2, 5)
        );
        preCoolingDone = true;
      }
      currentTemp = temp;
    } else if (hasIssues && hoursElapsed > 2 && hoursElapsed < 4 && Math.random() > 0.4) {
      temp = randomInRange(maxTemp + 1, maxTemp + 6);
      status = 'over';
    } else if (hasIssues && hoursElapsed > 6 && hoursElapsed < 7) {
      temp = randomInRange(minTemp - 5, minTemp - 1);
      status = 'under';
    } else if (hasIssues && hoursElapsed > 8 && hoursElapsed < 10 && i % 3 === 0) {
      temp = -999;
      status = 'missing';
    } else {
      temp = randomInRange(minTemp + 0.5, maxTemp - 0.5);
    }

    if (status === 'normal' && temp > maxTemp) status = 'over';
    if (status === 'normal' && temp < minTemp) status = 'under';

    points.push({
      timestamp,
      temperature: temp,
      humidity: randomInRange(45, 65),
      status
    });
  }

  return points;
}

function analyzeRisks(
  tempData: TemperaturePoint[],
  minTemp: number,
  maxTemp: number
): RiskPoint[] {
  const risks: RiskPoint[] = [];

  let i = 0;
  while (i < tempData.length) {
    const point = tempData[i];
    const hoursElapsed = (point.timestamp - tempData[0].timestamp) / (1000 * 60 * 60);

    if (hoursElapsed < 1.5 && point.temperature > maxTemp + 2) {
      let endIdx = i;
      while (endIdx < tempData.length && tempData[endIdx].temperature > maxTemp) {
        endIdx++;
      }
      const duration = (tempData[endIdx - 1].timestamp - point.timestamp) / (1000 * 60);
      if (duration > 30) {
        risks.push({
          id: randomId(),
          type: 'no_precooling',
          startTime: point.timestamp,
          endTime: tempData[endIdx - 1].timestamp,
          durationMinutes: Math.round(duration),
          severity: 'high',
          description: `起运前${Math.round(duration)}分钟未达到预冷温度要求，起始温度${point.temperature.toFixed(1)}°C`,
          temperatureRange: { min: point.temperature, max: tempData[endIdx - 1].temperature },
          confirmed: false,
          isQualified: null,
          auditorNote: ''
        });
      }
      i = endIdx;
      continue;
    }

    if (point.status === 'over' || point.status === 'under') {
      let endIdx = i;
      while (endIdx < tempData.length && (tempData[endIdx].status === 'over' || tempData[endIdx].status === 'under')) {
        endIdx++;
      }
      const duration = (tempData[endIdx - 1].timestamp - point.timestamp) / (1000 * 60);
      const temps = tempData.slice(i, endIdx).map(p => p.temperature);
      const type: RiskType = point.status === 'over' ? 'over_temp' : 'under_temp';
      risks.push({
        id: randomId(),
        type,
        startTime: point.timestamp,
        endTime: tempData[endIdx - 1].timestamp,
        durationMinutes: Math.round(duration),
        severity: duration > 30 ? 'high' : duration > 10 ? 'medium' : 'low',
        description: `${type === 'over_temp' ? '超高温' : '超低温'}持续${Math.round(duration)}分钟`,
        temperatureRange: { min: Math.min(...temps), max: Math.max(...temps) },
        confirmed: false,
        isQualified: null,
        auditorNote: ''
      });
      i = endIdx;
      continue;
    }

    if (point.status === 'missing') {
      let endIdx = i;
      while (endIdx < tempData.length && tempData[endIdx].status === 'missing') {
        endIdx++;
      }
      const duration = (tempData[endIdx - 1].timestamp - point.timestamp) / (1000 * 60);
      if (duration > 15) {
        risks.push({
          id: randomId(),
          type: 'data_gap',
          startTime: point.timestamp,
          endTime: tempData[endIdx - 1].timestamp,
          durationMinutes: Math.round(duration),
          severity: duration > 45 ? 'high' : duration > 25 ? 'medium' : 'low',
          description: `温度数据缺失${Math.round(duration)}分钟`,
          confirmed: false,
          isQualified: null,
          auditorNote: ''
        });
      }
      i = endIdx;
      continue;
    }

    if (i > 0) {
      const prevTemp = tempData[i - 1].temperature;
      if (point.temperature !== -999 && prevTemp !== -999) {
        const delta = Math.abs(point.temperature - prevTemp);
        if (delta > 5) {
          risks.push({
            id: randomId(),
            type: 'rapid_temp_change',
            startTime: tempData[i - 1].timestamp,
            endTime: point.timestamp,
            durationMinutes: 5,
            severity: delta > 10 ? 'high' : 'medium',
            description: `温度骤变${delta.toFixed(1)}°C，可能为异常开门`,
            temperatureRange: { min: Math.min(prevTemp, point.temperature), max: Math.max(prevTemp, point.temperature) },
            confirmed: false,
            isQualified: null,
            auditorNote: ''
          });
        }
      }
    }

    i++;
  }

  const totalHours = (tempData[tempData.length - 1].timestamp - tempData[0].timestamp) / (1000 * 60 * 60);
  if (totalHours > 8 && Math.random() > 0.7) {
    const startTime = tempData[0].timestamp + (totalHours - 2) * 60 * 60 * 1000;
    risks.push({
      id: randomId(),
      type: 'unloading_wait',
      startTime,
      endTime: startTime + 90 * 60 * 1000,
      durationMinutes: 90,
      severity: 'medium',
      description: '卸货等待时间过长（超过1小时）',
      confirmed: false,
      isQualified: null,
      auditorNote: ''
    });
  }

  return risks;
}

export function generateMockWaybills(count: number = 60): Waybill[] {
  const waybills: Waybill[] = [];
  const startDate = dayjs().subtract(90, 'day');

  for (let i = 0; i < count; i++) {
    const customer = randomChoice(CUSTOMERS);
    const carrier = randomChoice(CARRIERS);
    const route = randomChoice(ROUTES);
    const product = randomChoice(PRODUCTS);
    const shipDate = startDate.add(Math.floor(Math.random() * 90), 'day').hour(Math.floor(Math.random() * 12) + 6).minute(0);
    const durationHours = Math.max(2, Math.round(route.distanceKm / 70));
    const hasIssues = Math.random() > 0.5;

    const tempData = generateTemperatureData(
      product.minTemp,
      product.maxTemp,
      shipDate.valueOf(),
      durationHours,
      hasIssues
    );

    const riskPoints = analyzeRisks(tempData, product.minTemp, product.maxTemp);
    const reviewStatusRoll = Math.random();
    const reviewStatus: Waybill['reviewStatus'] = reviewStatusRoll > 0.7 ? 'completed' : reviewStatusRoll > 0.4 ? 'in_progress' : 'pending';

    waybills.push({
      id: `wb-${i + 1}`,
      waybillNo: `CC${shipDate.format('YYYYMMDD')}${String(i + 1).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      carrierId: carrier.id,
      carrierName: carrier.name,
      routeId: route.id,
      routeName: route.name,
      productId: product.id,
      productName: product.name,
      temperatureZone: product.temperatureZone,
      minTemp: product.minTemp,
      maxTemp: product.maxTemp,
      shipmentDate: shipDate.valueOf(),
      deliveryDate: shipDate.add(durationHours, 'hour').valueOf(),
      actualDeliveryDate: shipDate.add(durationHours + Math.random() * 2, 'hour').valueOf(),
      weightKg: Math.round(randomInRange(500, 5000)),
      quantity: Math.round(randomInRange(50, 500)),
      temperatureData: tempData,
      riskPoints,
      reviewStatus,
      finalResult: reviewStatus === 'completed' 
        ? (Math.random() > 0.3 ? 'qualified' : 'unqualified')
        : null,
      auditor: reviewStatus === 'completed' ? '质控员' : undefined,
      auditTime: reviewStatus === 'completed' ? shipDate.add(durationHours + 24, 'hour').valueOf() : undefined,
      auditOpinion: reviewStatus === 'completed' 
        ? (Math.random() > 0.3 ? '温度全程符合要求，准予放行' : '存在超温风险，需承运商整改')
        : undefined,
      carrierExplanation: hasIssues && Math.random() > 0.5 
        ? '途中遇交通管制，车辆怠速时间过长导致温度波动'
        : undefined,
      hasDispute: hasIssues && Math.random() > 0.8
    });
  }

  return waybills.sort((a, b) => b.shipmentDate - a.shipmentDate);
}

export function generateCarrierScores(waybills: Waybill[], dateRange?: [number, number] | null): CarrierScore[] {
  const grouped = new Map<string, Waybill[]>();
  waybills.forEach(w => {
    if (!grouped.has(w.carrierId)) grouped.set(w.carrierId, []);
    grouped.get(w.carrierId)!.push(w);
  });

  const scores: CarrierScore[] = [];
  const periodStart = dateRange ? dateRange[0] : dayjs().subtract(90, 'day').valueOf();
  const periodEnd = dateRange ? dateRange[1] : Date.now();

  CARRIERS.forEach(carrier => {
    const carrierWaybills = grouped.get(carrier.id) || [];
    const total = carrierWaybills.length || 1;
    const overTempCount = carrierWaybills.filter(w => w.riskPoints.some(r => r.type === 'over_temp' || r.type === 'under_temp')).length;
    const withExplanation = carrierWaybills.filter(w => w.carrierExplanation).length;
    const withExplanationNeeded = carrierWaybills.filter(w => w.riskPoints.length > 0).length || 1;
    const disputedCount = carrierWaybills.filter(w => w.hasDispute).length;
    const qualifiedCount = carrierWaybills.filter(w => w.finalResult === 'qualified').length;
    const completedCount = carrierWaybills.filter(w => w.reviewStatus === 'completed').length || 1;

    const overTempRate = overTempCount / total;
    const explanationCompleteRate = withExplanation / withExplanationNeeded;
    const disputeRate = disputedCount / total;
    const qualifiedRate = qualifiedCount / completedCount;

    const score = Math.round(
      (1 - overTempRate) * 40 +
      explanationCompleteRate * 25 +
      (1 - disputeRate) * 20 +
      qualifiedRate * 15
    );

    let grade: CarrierScore['grade'];
    if (score >= 90) grade = 'S';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    scores.push({
      carrierId: carrier.id,
      carrierName: carrier.name,
      totalWaybills: carrierWaybills.length,
      overTempCount,
      overTempRate: Math.round(overTempRate * 10000) / 100,
      explanationCompleteRate: Math.round(explanationCompleteRate * 10000) / 100,
      disputeRate: Math.round(disputeRate * 10000) / 100,
      avgResponseHours: Math.round(randomInRange(2, 48) * 10) / 10,
      qualifiedRate: Math.round(qualifiedRate * 10000) / 100,
      score,
      grade,
      periodStart,
      periodEnd
    });
  });

  return scores.sort((a, b) => b.score - a.score);
}

export { CUSTOMERS, CARRIERS, ROUTES, PRODUCTS };
