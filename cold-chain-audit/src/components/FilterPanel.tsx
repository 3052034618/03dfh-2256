import { Card, Select, DatePicker, Button, Space, Form } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { CUSTOMERS, CARRIERS, ROUTES } from '../data/mockData';
import { TEMPERATURE_ZONE_LABELS, REVIEW_STATUS_LABELS } from '../types';
import type { TemperatureZone, Waybill } from '../types';
import { useAuditStore } from '../store/useAuditStore';

const { RangePicker } = DatePicker;

export function FilterPanel() {
  const { filters, setFilters, resetFilters, getFilteredWaybills } = useAuditStore();
  const [form] = Form.useForm();

  const handleSearch = () => {
    form.validateFields().then((values) => {
      const dateRange = values.dateRange as [Dayjs, Dayjs] | null;
      setFilters({
        customerIds: values.customers || [],
        routeIds: values.routes || [],
        carrierIds: values.carriers || [],
        temperatureZones: values.temperatureZones || [],
        dateRange: dateRange ? [dateRange[0].valueOf(), dateRange[1].valueOf()] : null,
        reviewStatus: values.reviewStatus
      });
    });
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
  };

  const filteredCount = getFilteredWaybills().length;

  return (
    <Card
      className="filter-panel"
      styles={{ body: { padding: '20px 24px' } }}
      title={
        <Space>
          <FilterOutlined style={{ color: '#1890ff' }} />
          <span>运单筛选</span>
          <span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 'normal' }}>
            (共 {filteredCount} 条记录)
          </span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="horizontal"
        initialValues={{
          customers: filters.customerIds,
          routes: filters.routeIds,
          carriers: filters.carrierIds,
          temperatureZones: filters.temperatureZones,
          dateRange: filters.dateRange ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])] : null,
          reviewStatus: filters.reviewStatus
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
          <Form.Item label="客户" name="customers" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Select
              mode="multiple"
              placeholder="请选择客户"
              allowClear
              maxTagCount="responsive"
              options={CUSTOMERS.map(c => ({ label: c.name, value: c.id }))}
              size="middle"
            />
          </Form.Item>

          <Form.Item label="线路" name="routes" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Select
              mode="multiple"
              placeholder="请选择线路"
              allowClear
              maxTagCount="responsive"
              options={ROUTES.map(r => ({ label: r.name, value: r.id }))}
              size="middle"
            />
          </Form.Item>

          <Form.Item label="承运商" name="carriers" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Select
              mode="multiple"
              placeholder="请选择承运商"
              allowClear
              maxTagCount="responsive"
              options={CARRIERS.map(c => ({ label: c.name, value: c.id }))}
              size="middle"
            />
          </Form.Item>

          <Form.Item label="温区" name="temperatureZones" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Select
              mode="multiple"
              placeholder="请选择温区"
              allowClear
              options={(Object.entries(TEMPERATURE_ZONE_LABELS) as [TemperatureZone, string][]).map(([value, label]) => ({
                label,
                value
              }))}
              size="middle"
            />
          </Form.Item>

          <Form.Item label="发运日期" name="dateRange" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <RangePicker
              style={{ width: '100%' }}
              size="middle"
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>

          <Form.Item label="复核状态" name="reviewStatus" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Select
              placeholder="全部状态"
              allowClear
              options={(Object.entries(REVIEW_STATUS_LABELS) as [Waybill['reviewStatus'], string][]).map(([value, label]) => ({
                label,
                value
              }))}
              size="middle"
            />
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
}
