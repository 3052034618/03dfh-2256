import { Table, Tag, Button, Space, Checkbox, Tooltip } from 'antd';
import { EyeOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

  const filteredWaybills = getFilteredWaybills();

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
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(record)}
        >
          详情
        </Button>
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
    </div>
  );
}
