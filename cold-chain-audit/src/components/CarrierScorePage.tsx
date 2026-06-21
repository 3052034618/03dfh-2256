import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Statistic,
  Row,
  Col,
  Progress,
  Tooltip,
  message,
  Empty
} from 'antd';
import {
  TrophyOutlined,
  DownloadOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs, { type Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';
import type { TableProps } from 'antd';
import type { CarrierScore } from '../types';
import { GRADE_COLORS } from '../types';
import { useAuditStore } from '../store/useAuditStore';

const { RangePicker } = DatePicker;

export function CarrierScorePage() {
  const { carrierScores, waybills } = useAuditStore();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);

  const filteredScores = useMemo(() => {
    let result = [...carrierScores];
    if (selectedCarriers.length > 0) {
      result = result.filter(s => selectedCarriers.includes(s.carrierId));
    }
    return result.sort((a, b) => b.score - a.score);
  }, [carrierScores, selectedCarriers]);

  const stats = useMemo(() => {
    const total = filteredScores.length;
    const avgScore = total > 0 ? filteredScores.reduce((sum, s) => sum + s.score, 0) / total : 0;
    const avgOverTempRate = total > 0 ? filteredScores.reduce((sum, s) => sum + s.overTempRate, 0) / total : 0;
    const avgQualifiedRate = total > 0 ? filteredScores.reduce((sum, s) => sum + s.qualifiedRate, 0) / total : 0;
    return { total, avgScore, avgOverTempRate, avgQualifiedRate };
  }, [filteredScores]);

  const chartOption = useMemo(() => {
    if (filteredScores.length === 0) return {};
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        textStyle: { color: '#262626' }
      },
      legend: {
        data: ['综合评分', '合格率', '超温率'],
        top: 0
      },
      grid: {
        left: 50,
        right: 50,
        top: 40,
        bottom: 60
      },
      xAxis: {
        type: 'category',
        data: filteredScores.map(s => s.carrierName),
        axisLabel: {
          color: '#8c8c8c',
          rotate: 20,
          fontSize: 11
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '评分 / 合格率 (%)',
          max: 100,
          axisLabel: { color: '#8c8c8c', formatter: '{value}' },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        {
          type: 'value',
          name: '超温率 (%)',
          max: 100,
          axisLabel: { color: '#fa8c16', formatter: '{value}%' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '综合评分',
          type: 'bar',
          data: filteredScores.map(s => s.score),
          itemStyle: {
            color: (params: any) => {
              const score = filteredScores[params.dataIndex].score;
              if (score >= 90) return '#52c41a';
              if (score >= 80) return '#1890ff';
              if (score >= 70) return '#faad14';
              if (score >= 60) return '#fa8c16';
              return '#f5222d';
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: 24
        },
        {
          name: '合格率',
          type: 'line',
          data: filteredScores.map(s => s.qualifiedRate),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#13c2c2' },
          itemStyle: { color: '#13c2c2' }
        },
        {
          name: '超温率',
          type: 'line',
          yAxisIndex: 1,
          data: filteredScores.map(s => s.overTempRate),
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#fa8c16', type: 'dashed' },
          itemStyle: { color: '#fa8c16' }
        }
      ]
    };
  }, [filteredScores]);

  const handleExport = () => {
    if (filteredScores.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }

    const exportData = filteredScores.map(s => ({
      '排名': filteredScores.findIndex(f => f.carrierId === s.carrierId) + 1,
      '承运商': s.carrierName,
      '等级': s.grade,
      '综合评分': s.score,
      '运单总数': s.totalWaybills,
      '超温次数': s.overTempCount,
      '超温率(%)': s.overTempRate,
      '解释完整率(%)': s.explanationCompleteRate,
      '争议率(%)': s.disputeRate,
      '平均响应时长(小时)': s.avgResponseHours,
      '合格率(%)': s.qualifiedRate,
      '统计周期': `${dayjs(s.periodStart).format('YYYY-MM-DD')} 至 ${dayjs(s.periodEnd).format('YYYY-MM-DD')}`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '承运商评分');
    XLSX.writeFile(wb, `承运商质量评分报表_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`);
    message.success('导出成功');
  };

  const columns: TableProps<CarrierScore>['columns'] = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (_, __, index) => {
        if (index === 0) return <TrophyOutlined style={{ color: '#fadb14', fontSize: 18 }} />;
        if (index === 1) return <TrophyOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />;
        if (index === 2) return <TrophyOutlined style={{ color: '#d48806', fontSize: 18 }} />;
        return <span style={{ color: '#8c8c8c' }}>{index + 1}</span>;
      }
    },
    {
      title: '承运商',
      dataIndex: 'carrierName',
      key: 'carrierName',
      width: 140,
      fixed: 'left'
    },
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      align: 'center',
      render: (grade) => (
        <Tag
          color={GRADE_COLORS[grade as keyof typeof GRADE_COLORS]}
          style={{
            fontSize: 14,
            fontWeight: 600,
            padding: '2px 12px',
            borderRadius: 4
          }}
        >
          {grade}
        </Tag>
      )
    },
    {
      title: '综合评分',
      dataIndex: 'score',
      key: 'score',
      width: 140,
      align: 'center',
      render: (score, record) => (
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size={4}>
          <strong style={{ color: GRADE_COLORS[record.grade], fontSize: 16 }}>{score}</strong>
          <Progress
            percent={score}
            size="small"
            showInfo={false}
            strokeColor={GRADE_COLORS[record.grade]}
            trailColor="#f0f0f0"
          />
        </Space>
      )
    },
    {
      title: '运单总数',
      dataIndex: 'totalWaybills',
      key: 'totalWaybills',
      width: 100,
      align: 'center',
      render: (val) => <strong>{val}</strong>
    },
    {
      title: '超温次数',
      dataIndex: 'overTempCount',
      key: 'overTempCount',
      width: 100,
      align: 'center',
      render: (val) => (
        <span style={{ color: val > 5 ? '#f5222d' : val > 2 ? '#fa8c16' : '#52c41a' }}>
          {val}
        </span>
      )
    },
    {
      title: '超温率',
      dataIndex: 'overTempRate',
      key: 'overTempRate',
      width: 100,
      align: 'center',
      render: (val) => (
        <span style={{ color: val > 30 ? '#f5222d' : val > 15 ? '#fa8c16' : '#52c41a' }}>
          {val.toFixed(1)}%
        </span>
      )
    },
    {
      title: '解释完整率',
      dataIndex: 'explanationCompleteRate',
      key: 'explanationCompleteRate',
      width: 110,
      align: 'center',
      render: (val) => (
        <span style={{ color: val >= 80 ? '#52c41a' : val >= 60 ? '#faad14' : '#f5222d' }}>
          {val.toFixed(1)}%
        </span>
      )
    },
    {
      title: '争议率',
      dataIndex: 'disputeRate',
      key: 'disputeRate',
      width: 90,
      align: 'center',
      render: (val) => (
        <span style={{ color: val > 10 ? '#f5222d' : val > 5 ? '#faad14' : '#52c41a' }}>
          {val.toFixed(1)}%
        </span>
      )
    },
    {
      title: '平均响应',
      dataIndex: 'avgResponseHours',
      key: 'avgResponseHours',
      width: 100,
      align: 'center',
      render: (val) => `${val}h`
    },
    {
      title: '合格率',
      dataIndex: 'qualifiedRate',
      key: 'qualifiedRate',
      width: 100,
      align: 'center',
      render: (val) => (
        <span style={{ color: val >= 90 ? '#52c41a' : val >= 75 ? '#faad14' : '#f5222d' }}>
          {val.toFixed(1)}%
        </span>
      )
    }
  ];

  const carrierOptions = Array.from(
    new Map(waybills.map(w => [w.carrierId, w.carrierName])).entries()
  ).map(([id, name]) => ({ label: name, value: id }));

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <BarChartOutlined style={{ color: '#722ed1', fontSize: 18 }} />
            <span>承运商质量评分</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              mode="multiple"
              placeholder="选择承运商"
              style={{ width: 250 }}
              value={selectedCarriers}
              onChange={setSelectedCarriers}
              options={carrierOptions}
              allowClear
              size="middle"
            />
            <RangePicker
              value={dateRange}
              onChange={(val) => setDateRange(val as [Dayjs, Dayjs] | null)}
              size="middle"
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              size="middle"
              style={{
                background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                boxShadow: '0 2px 8px rgba(114, 46, 209, 0.35)'
              }}
            >
              导出报表
            </Button>
          </Space>
        }
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '20px 24px' }}>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card size="small" styles={{ body: { padding: '16px' } }}>
                <Statistic
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: '#faad14' }} />
                      <span>承运商数量</span>
                    </Space>
                  }
                  value={stats.total}
                  valueStyle={{ color: '#262626' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" styles={{ body: { padding: '16px' } }}>
                <Statistic
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>平均评分</span>
                    </Space>
                  }
                  value={stats.avgScore.toFixed(1)}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="/ 100"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" styles={{ body: { padding: '16px' } }}>
                <Statistic
                  title={
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                      <span>平均超温率</span>
                    </Space>
                  }
                  value={stats.avgOverTempRate.toFixed(1)}
                  valueStyle={{ color: '#fa8c16' }}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" styles={{ body: { padding: '16px' } }}>
                <Statistic
                  title={
                    <Space>
                      <WarningOutlined style={{ color: '#1890ff' }} />
                      <span>平均合格率</span>
                    </Space>
                  }
                  value={stats.avgQualifiedRate.toFixed(1)}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {filteredScores.length > 0 ? (
            <Card
              size="small"
              title="评分对比图"
              style={{ marginBottom: 20 }}
            >
              <ReactECharts
                option={chartOption}
                style={{ height: 320, width: '100%' }}
                notMerge
              />
            </Card>
          ) : (
            <Empty description="暂无评分数据" style={{ margin: '60px 0' }} />
          )}

          <Table
            columns={columns}
            dataSource={filteredScores}
            rowKey="carrierId"
            size="middle"
            scroll={{ x: 1200 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 家承运商`,
              pageSize: 10
            }}
          />
        </div>

        <div
          style={{
            padding: '12px 24px',
            background: '#fafafa',
            borderTop: '1px solid #f0f0f0',
            fontSize: 12,
            color: '#8c8c8c'
          }}
        >
          <Space size={24}>
            <span>评分规则：超温率(40%) + 解释完整率(25%) + 无争议率(20%) + 合格率(15%)</span>
            <Tooltip title="S: ≥90, A: 80-89, B: 70-79, C: 60-69, D: <60">
              <span>等级说明：S 优秀 | A 良好 | B 合格 | C 待改进 | D 不合格</span>
            </Tooltip>
          </Space>
        </div>
      </Card>
    </div>
  );
}
