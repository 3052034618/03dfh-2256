import { useState } from 'react';
import { Table, Tag, Button, Space, Checkbox, Tooltip, Modal, Descriptions, Divider } from 'antd';
import { EyeOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import type { Waybill } from '../types';
import { TEMPERATURE_ZONE_LABELS, REVIEW_STATUS_LABELS } from '../types';
import { useAuditStore } from '../store/useAuditStore';

interface WaybillTableProps {
  onViewDetail: (waybill: Waybill) => void;
}

export function WaybillTable({ onViewDetail }: WaybillTableProps) {
  const {
    waybills,
    selectedWaybills,
    selectWaybill,
    selectAllWaybills,
    getFilteredWaybills,
    enterReviewMode,
    getSelectedWaybillObjects
  } = useAuditStore();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailWaybill, setDetailWaybill] = useState<Waybill | null>(null);

  const filteredWaybills = getFilteredWaybills();

  const handleViewDetail = (waybill: Waybill) => {
    setDetailWaybill(waybill);
    setDetailModalOpen(true);
  };

  const columns: TableProps<Waybill>['columns'] = [
    {
      title: (
        <Checkbox
          checked={filteredWaybills.length > 0 && filteredWaybills.every(w => selectedWaybills.includes(w.id))}
          indeterminate={filteredWaybills.some(w => selectedWaybills.includes(w.id)) && !filteredWaybills.every(w => selectedWaybills.includes(w.id))}
          onChange={(e) => {
            if (e.target.checked) {
              selectAllWaybills(filteredWaybills.map(w => w.id));
            } else {
              selectAllWaybills([]);
            }
          }}
        />
      ),
      dataIndex: 'id',
      key: 'select',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedWaybills.includes(record.id)}
          onChange={(e) => selectWaybill(record.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      title: '运单号',
      dataIndex: 'waybillNo',
      key: 'waybillNo',
      width: 160,
      render: (text) => (
        <span style={{ fontFamily: 'monospace', color: '#262626', fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      ellipsis: true
    },
    {
      title: '线路',
      dataIndex: 'routeName',
      key: 'routeName',
      width: 120
    },
    {
      title: '承运商',
      dataIndex: 'carrierName',
      key: 'carrierName',
      width: 120
    },
    {
      title: '货品',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
      ellipsis: true
    },
    {
      title: '温区',
      dataIndex: 'temperatureZone',
      key: 'temperatureZone',
      width: 140,
      render: (zone) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {TEMPERATURE_ZONE_LABELS[zone as keyof typeof TEMPERATURE_ZONE_LABELS]}
        </Tag>
      )
    },
    {
      title: '发运时间',
      dataIndex: 'shipmentDate',
      key: 'shipmentDate',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '风险点',
      dataIndex: 'riskPoints',
      key: 'riskPoints',
      width: 100,
      align: 'center',
      render: (risks) => {
        if (!risks || risks.length === 0) {
          return <Tag color="success">无</Tag>;
        }
        const highRisks = risks.filter((r: { severity: string }) => r.severity === 'high').length;
        const mediumRisks = risks.filter((r: { severity: string }) => r.severity === 'medium').length;
        return (
          <Tooltip title={`高风险 ${highRisks} 个，中风险 ${mediumRisks} 个，低风险 ${risks.length - highRisks - mediumRisks} 个`}>
            <Tag color="warning" icon={<WarningOutlined />}>
              {risks.length} 个
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '复核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 100,
      render: (status) => {
        const iconMap: Record<Waybill['reviewStatus'], React.ReactNode> = {
          pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
          in_progress: <WarningOutlined style={{ color: '#1890ff' }} />,
          completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        };
        const colorMap: Record<Waybill['reviewStatus'], string> = {
          pending: 'warning',
          in_progress: 'processing',
          completed: 'success'
        };
        const s = status as Waybill['reviewStatus'];
        return (
          <Tag icon={iconMap[s]} color={colorMap[s]} style={{ margin: 0 }}>
            {REVIEW_STATUS_LABELS[s]}
          </Tag>
        );
      }
    },
    {
      title: '判定结果',
      dataIndex: 'finalResult',
      key: 'finalResult',
      width: 100,
      render: (result) => {
        if (result === null) return <span style={{ color: '#bfbfbf' }}>-</span>;
        if (result === 'qualified') {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              合格
            </Tag>
          );
        }
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            不合格
          </Tag>
        );
      }
    },
    {
      title: '稽核意见',
      dataIndex: 'auditOpinion',
      key: 'auditOpinion',
      width: 220,
      ellipsis: true,
      render: (opinion: string | undefined, record) => {
        if (!opinion) {
          return <span style={{ color: '#bfbfbf' }}>-</span>;
        }
        const summary = opinion.length > 25 ? opinion.substring(0, 25) + '...' : opinion;
        const color = record.finalResult === 'qualified' ? '#52c41a' : '#f5222d';
        return (
          <Tooltip
            title={
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>{opinion}</div>
                <Divider style={{ margin: '6px 0' }} />
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  审核人：{record.auditor || '质控员'}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  审核时间：{record.auditTime ? dayjs(record.auditTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </div>
              </div>
            }
          >
            <span style={{ color, cursor: 'pointer', fontWeight: 500 }}>{summary}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => onViewDetail(record)}
            style={{ padding: 0 }}
          >
            复核
          </Button>
        </Space>
      )
    }
  ];

  const selectedObjects = getSelectedWaybillObjects();

  return (
    <div style={{ position: 'relative' }}>
      {selectedWaybills.length > 0 && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <span style={{ color: '#1890ff', fontWeight: 500 }}>
              已选择 <strong>{selectedWaybills.length}</strong> 条运单
            </span>
            <span style={{ color: '#8c8c8c', fontSize: 13 }}>
              (待复核 {selectedObjects.filter(w => w.reviewStatus === 'pending').length} 条，
              复核中 {selectedObjects.filter(w => w.reviewStatus === 'in_progress').length} 条，
              已完成 {selectedObjects.filter(w => w.reviewStatus === 'completed').length} 条)
            </span>
          </Space>
          <Button
            type="primary"
            size="large"
            onClick={enterReviewMode}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.35)'
            }}
          >
            开始批量复核
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredWaybills}
        rowKey="id"
        scroll={{ x: 1400, y: 'calc(100vh - 420px)' }}
        size="middle"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSize: 20,
          size: 'small'
        }}
        rowClassName={(record) => {
          if (record.finalResult === 'unqualified') return 'row-unqualified';
          if (record.riskPoints.length > 0) return 'row-has-risk';
          return '';
        }}
        onRow={(record) => ({
          onDoubleClick: () => onViewDetail(record)
        })}
      />

      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>运单详情</span>
            <Tag color="blue">{detailWaybill?.waybillNo}</Tag>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        onOk={() => setDetailModalOpen(false)}
        width={900}
        destroyOnClose
        okText="关闭"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        {detailWaybill && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="运单号">{detailWaybill.waybillNo}</Descriptions.Item>
              <Descriptions.Item label="发运时间">{dayjs(detailWaybill.shipmentDate).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="客户">{detailWaybill.customerName}</Descriptions.Item>
              <Descriptions.Item label="预计到达">{dayjs(detailWaybill.deliveryDate).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="承运商">{detailWaybill.carrierName}</Descriptions.Item>
              <Descriptions.Item label="实际到达">{detailWaybill.actualDeliveryDate ? dayjs(detailWaybill.actualDeliveryDate).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
              <Descriptions.Item label="线路">{detailWaybill.routeName}</Descriptions.Item>
              <Descriptions.Item label="温区">{TEMPERATURE_ZONE_LABELS[detailWaybill.temperatureZone]}</Descriptions.Item>
              <Descriptions.Item label="货品">{detailWaybill.productName}</Descriptions.Item>
              <Descriptions.Item label="重量">{detailWaybill.weightKg} kg</Descriptions.Item>
              <Descriptions.Item label="数量">{detailWaybill.quantity} 件</Descriptions.Item>
              <Descriptions.Item label="风险点">{detailWaybill.riskPoints.length} 个</Descriptions.Item>
              <Descriptions.Item label="复核状态">
                {REVIEW_STATUS_LABELS[detailWaybill.reviewStatus]}
              </Descriptions.Item>
              <Descriptions.Item label="判定结果">
                {detailWaybill.finalResult === 'qualified' ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>合格</Tag>
                ) : detailWaybill.finalResult === 'unqualified' ? (
                  <Tag color="error" icon={<CloseCircleOutlined />}>不合格</Tag>
                ) : (
                  <span style={{ color: '#bfbfbf' }}>待判定</span>
                )}
              </Descriptions.Item>
            </Descriptions>

            {detailWaybill.reviewStatus === 'completed' && (
              <>
                <Divider orientation="left" style={{ marginTop: 0 }}>
                  <Space>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    <span>稽核信息</span>
                  </Space>
                </Divider>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="审核人">{detailWaybill.auditor || '质控员'}</Descriptions.Item>
                  <Descriptions.Item label="审核时间">
                    {detailWaybill.auditTime ? dayjs(detailWaybill.auditTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="稽核意见" span={2}>
                    <div style={{
                      padding: '12px 16px',
                      background: detailWaybill.finalResult === 'qualified' ? '#f6ffed' : '#fff1f0',
                      borderRadius: 6,
                      border: `1px solid ${detailWaybill.finalResult === 'qualified' ? '#b7eb8f' : '#ffa39e'}`,
                      color: detailWaybill.finalResult === 'qualified' ? '#389e0d' : '#cf1322',
                      lineHeight: 1.7
                    }}>
                      {detailWaybill.auditOpinion}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {detailWaybill.carrierExplanation && (
              <>
                <Divider orientation="left">
                  <Space>
                    <WarningOutlined style={{ color: '#722ed1' }} />
                    <span>承运商申诉说明</span>
                  </Space>
                </Divider>
                <div style={{
                  padding: '12px 16px',
                  background: '#f9f0ff',
                  borderRadius: 6,
                  border: '1px solid #d3adf7',
                  color: '#531dab',
                  lineHeight: 1.7
                }}>
                  {detailWaybill.carrierExplanation}
                </div>
              </>
            )}

            {detailWaybill.riskPoints.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    <span>风险点列表 ({detailWaybill.riskPoints.length})</span>
                  </Space>
                </Divider>
                <Descriptions column={1} size="small" bordered>
                  {detailWaybill.riskPoints.map((risk, idx) => (
                    <Descriptions.Item key={risk.id} label={`风险点 ${idx + 1}`}>
                      <Space direction="vertical" size={4}>
                        <div>
                          <Tag color={risk.severity === 'high' ? 'error' : risk.severity === 'medium' ? 'warning' : 'default'}>
                            {risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
                          </Tag>
                          <strong>{risk.type === 'no_precooling' ? '起运前未预冷' : risk.type === 'over_temp' ? '温度超标(高)' : risk.type === 'under_temp' ? '温度超标(低)' : risk.type === 'data_gap' ? '连续数据缺失' : risk.type === 'rapid_temp_change' ? '温度骤变' : '卸货等待过长'}</strong>
                          <span style={{ color: '#8c8c8c', marginLeft: 12 }}>
                            {dayjs(risk.startTime).format('HH:mm')} - {dayjs(risk.endTime).format('HH:mm')}  ({risk.durationMinutes}分钟)
                          </span>
                        </div>
                        <div style={{ color: '#595959' }}>{risk.description}</div>
                        {risk.confirmed && (
                          <div style={{ fontSize: 12 }}>
                            <Tag color={risk.isQualified ? 'success' : 'error'} style={{ margin: 0 }}>
                              {risk.isQualified ? '予以通过' : '判定不合格'}
                            </Tag>
                            {risk.auditorNote && <span style={{ color: '#8c8c8c', marginLeft: 8 }}>备注: {risk.auditorNote}</span>}
                          </div>
                        )}
                      </Space>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
