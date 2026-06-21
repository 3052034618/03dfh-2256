import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import type { TemperaturePoint, RiskPoint } from '../types';

interface TemperatureChartProps {
  data: TemperaturePoint[];
  minTemp: number;
  maxTemp: number;
  riskPoints?: RiskPoint[];
  height?: number | string;
}

export function TemperatureChart({
  data,
  minTemp,
  maxTemp,
  riskPoints = [],
  height = 400
}: TemperatureChartProps) {
  const option = useMemo(() => {
    const validData = data.filter(p => p.temperature !== -999);
    const times = validData.map(p => dayjs(p.timestamp).format('HH:mm'));
    const temps = validData.map(p => p.temperature);
    const missingPoints = data
      .map((p, idx) => ({ ...p, idx }))
      .filter(p => p.temperature === -999);

    const riskMarkAreas = riskPoints.map(risk => {
      const startIdx = data.findIndex(p => p.timestamp >= risk.startTime);
      const endIdx = data.findIndex(p => p.timestamp >= risk.endTime);
      const startX = startIdx >= 0 ? startIdx : 0;
      const endX = endIdx >= 0 ? endIdx : data.length - 1;

      const colorMap: Record<string, string> = {
        no_precooling: 'rgba(245, 34, 45, 0.15)',
        over_temp: 'rgba(250, 140, 22, 0.2)',
        under_temp: 'rgba(24, 144, 255, 0.2)',
        data_gap: 'rgba(114, 46, 209, 0.15)',
        rapid_temp_change: 'rgba(250, 173, 20, 0.2)',
        unloading_wait: 'rgba(114, 46, 209, 0.15)',
        door_open: 'rgba(250, 173, 20, 0.2)'
      };

      return [
        { xAxis: startX, itemStyle: { color: colorMap[risk.type] || 'rgba(250, 173, 20, 0.2)' } },
        { xAxis: endX }
      ];
    });

    const yMin = Math.min(minTemp - 5, ...temps) - 2;
    const yMax = Math.max(maxTemp + 5, ...temps) + 2;

    return {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        textStyle: { color: '#262626', fontSize: 12 },
        formatter: (params: any) => {
          const dataPoint = params[0];
          if (!dataPoint) return '';
          const point = validData[dataPoint.dataIndex];
          if (!point) return '';
          
          let statusText = '<span style="color:#52c41a">正常</span>';
          if (point.status === 'over') statusText = '<span style="color:#fa8c16">超高温</span>';
          if (point.status === 'under') statusText = '<span style="color:#1890ff">超低温</span>';
          
          return `
            <div style="font-weight: 600; margin-bottom: 6px; color: #262626">
              ${dayjs(point.timestamp).format('YYYY-MM-DD HH:mm')}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="width: 10px; height: 10px; background: #13c2c2; border-radius: 50%; display: inline-block"></span>
              <span style="color: #595959">温度:</span>
              <span style="font-weight: 600; color: #13c2c2">${point.temperature.toFixed(1)}°C</span>
            </div>
            ${point.humidity ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="width: 10px; height: 10px; background: #722ed1; border-radius: 50%; display: inline-block"></span>
              <span style="color: #595959">湿度:</span>
              <span style="font-weight: 600; color: #722ed1">${point.humidity.toFixed(1)}%</span>
            </div>
            ` : ''}
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0f0f0">
              状态: ${statusText}
            </div>
          `;
        }
      },
      grid: {
        left: 60,
        right: 40,
        top: 30,
        bottom: 60
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#8c8c8c',
          fontSize: 11,
          rotate: 30,
          interval: Math.floor(times.length / 8)
        },
        name: '时间',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: { color: '#8c8c8c', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#8c8c8c',
          fontSize: 11,
          formatter: '{value}°C'
        },
        splitLine: {
          lineStyle: { color: '#f0f0f0', type: 'dashed' }
        },
        name: '温度 (°C)',
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: { color: '#8c8c8c', fontSize: 12 }
      },
      visualMap: {
        show: false,
        pieces: [
          { gt: maxTemp, color: '#fa8c16' },
          { lt: minTemp, color: '#1890ff' },
          { gte: minTemp, lte: maxTemp, color: '#13c2c2' }
        ],
        outOfRange: { color: '#d9d9d9' }
      },
      series: [
        {
          name: '温度',
          type: 'line',
          data: temps,
          smooth: false,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { width: 2 },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              width: 1
            },
            data: [
              {
                yAxis: maxTemp,
                lineStyle: { color: '#fa8c16' },
                label: {
                  position: 'end',
                  formatter: `上限 ${maxTemp}°C`,
                  color: '#fa8c16',
                  fontSize: 11,
                  backgroundColor: '#fff7e6',
                  padding: [2, 6]
                }
              },
              {
                yAxis: minTemp,
                lineStyle: { color: '#1890ff' },
                label: {
                  position: 'end',
                  formatter: `下限 ${minTemp}°C`,
                  color: '#1890ff',
                  fontSize: 11,
                  backgroundColor: '#e6f7ff',
                  padding: [2, 6]
                }
              }
            ]
          },
          markArea: {
            silent: true,
            data: riskMarkAreas
          }
        },
        ...(missingPoints.length > 0 ? [
          {
            name: '数据缺失',
            type: 'scatter',
            data: missingPoints.map(p => ({
              value: [p.idx, (yMin + yMax) / 2],
              symbolSize: 8
            })),
            itemStyle: {
              color: '#722ed1',
              opacity: 0.6
            },
            tooltip: {
              formatter: () => '<span style="color:#722ed1">⚠️ 温度数据缺失</span>'
            }
          }
        ] : [])
      ]
    };
  }, [data, minTemp, maxTemp, riskPoints]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
}
