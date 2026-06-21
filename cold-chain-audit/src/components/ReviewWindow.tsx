import { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Card,
  Tag,
  Button,
  Space,
  Descriptions,
  List,
  Radio,
  Input,
  Badge,
  Divider,
  Row,
  Col,
  Statistic,
  Steps,
  Tooltip,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Waybill, RiskPoint } from '../types';
import {
  RISK_TYPE_LABELS,
  SEVERITY_LABELS,
  TEMPERATURE_ZONE_LABELS,
  REVIEW_STATUS_LABELS
} from '../types';
import { TemperatureChart } from './TemperatureChart';
import { useAuditStore } from '../store/useAuditStore';

const { TextArea } = Input;

interface ReviewWindowProps {
  open: boolean;
  onClose: () => void;
}

export function ReviewWindow({ open, onClose }: ReviewWindowProps) {
  const {
    currentWaybill,
    reviewWaybillIndex,
    getSelectedWaybillObjects,
    prevWaybill,
    nextWaybill,
    updateRiskPoint,
    updateWaybillResult,
    exitReviewMode
  } = useAuditStore();

  const [auditOpinion, setAuditOpinion] = useState('');
  const [finalResult, setFinalResult] = useState<'qualified' | 'unqualified' | null>(null);

  const selectedWaybills = getSelectedWaybillObjects();

  useEffect(() => {
    if (currentWaybill) {
      setFinalResult(currentWaybill.finalResult);
      setAuditOpinion(currentWaybill.auditOpinion || '');
    }
  }, [currentWaybill?.id]);

  const handleRiskConfirm = (riskId: string, isQualified: boolean, note: string) => {
    if (!currentWaybill) return;
    updateRiskPoint(currentWaybill.id, riskId, {
      confirmed: true,
      isQualified,
      auditorNote: note
    });
  };

  const handleSubmit = () => {
    if (!currentWaybill) return;
    if (finalResult === null) {
      message.warning('请先选择最终判定结果');
      return;
    }
    if (!auditOpinion.trim()) {
      message.warning('请填写稽核意见');
      return;
    }

    const unconfirmedRisks = currentWaybill.riskPoints.filter(r => !r.confirmed);
    if (unconfirmedRisks.length > 0) {
      message.warning(`还有 ${unconfirmedRisks.length} 个风险点未确认`);
      return;
    }

    updateWaybillResult(currentWaybill.id, finalResult, auditOpinion.trim());
    message.success('复核完成');

    if (reviewWaybillIndex < selectedWaybills.length - 1) {
      nextWaybill();
      setFinalResult(null);
      setAuditOpinion('');
    } else {
      message.success('批次复核全部完成！');
      onClose();
    }
  };

  const handleClose = () => {
    exitReviewMode();
    onClose();
  };

  const riskStats = useMemo(() => {
    if (!currentWaybill) return { total: 0, confirmed: 0, high: 0, medium: 0, low: 0 };
    const risks = currentWaybill.riskPoints;
    return {
      total: risks.length,
      confirmed: risks.filter(r => r.confirmed).length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    };
  }, [currentWaybill]);

  if (!currentWaybill) return null;

  return (
    <Modal
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <SafetyOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span>运单温度复核</span>
            <Tag color="blue">{currentWaybill.waybillNo}</Tag>
            <Steps
              size="small"
              current={reviewWaybillIndex}
              items={selectedWaybills.slice(0, 5).map((_, idx) => ({
                title: idx + 1
              }))}
              style={{ marginLeft: 24 }}
            />
            {selectedWaybills.length > 5 && (
              <span style={{ color: '#8c8c8c' }}>
                {reviewWaybillIndex + 1} / {selectedWaybills.length}
              </span>
            )}
          </Space>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={1200}
      footer={null}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '20px 24px' }}>
        <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '12px 16px' } }}>
          <Descriptions column={4} size="small">
            <Descriptions.Item label="客户">{currentWaybill.customerName}</Descriptions.Item>
            <Descriptions.Item label="线路">{currentWaybill.routeName}</Descriptions.Item>
            <Descriptions.Item label="承运商">{currentWaybill.carrierName}</Descriptions.Item>
            <Descriptions.Item label="复核状态">
              <Tag>{REVIEW_STATUS_LABELS[currentWaybill.reviewStatus]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="货品">{currentWaybill.productName}</Descriptions.Item>
            <Descriptions.Item label="温区">
              <Tag color="blue">{TEMPERATURE_ZONE_LABELS[currentWaybill.temperatureZone]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发运时间">
              {dayjs(currentWaybill.shipmentDate).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="预计到达">
              {dayjs(currentWaybill.deliveryDate).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Row gutter={16}>
          <Col span={17}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#13c2c2' }} />
                  <span>温度曲线</span>
                  <span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 'normal' }}>
                    温度范围: {currentWaybill.minTemp}°C ~ {currentWaybill.maxTemp}°C
                  </span>
                </Space>
              }
              size="small"
            >
              <TemperatureChart
                data={currentWaybill.temperatureData}
                minTemp={currentWaybill.minTemp}
                maxTemp={currentWaybill.maxTemp}
                riskPoints={currentWaybill.riskPoints}
                height={380}
              />
            </Card>
          </Col>

          <Col span={7}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>风险点判定</span>
                  <Badge count={riskStats.total - riskStats.confirmed} overflowCount={99} style={{ backgroundColor: '#faad14' }} />
                </Space>
              }
              size="small"
              styles={{ body: { padding: '12px' } }}
            >
              <Row gutter={8} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Statistic
                    title="高风险"
                    value={riskStats.high}
                    valueStyle={{ color: '#f5222d', fontSize: 18 }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="中风险"
                    value={riskStats.medium}
                    valueStyle={{ color: '#fa8c16', fontSize: 18 }}
                    prefix={<WarningOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="低风险"
                    value={riskStats.low}
                    valueStyle={{ color: '#faad14', fontSize: 18 }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 12px' }} />

              {currentWaybill.riskPoints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8c8c8c' }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <p>未检测到风险点</p>
                </div>
              ) : (
                <List
                  size="small"
                  dataSource={currentWaybill.riskPoints}
                  renderItem={(risk) => (
                    <RiskItem
                      key={risk.id}
                      risk={risk}
                      onConfirm={handleRiskConfirm}
                    />
                  )}
                  style={{ maxHeight: 300, overflowY: 'auto' }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {currentWaybill.carrierExplanation && (
          <Card
            size="small"
            style={{ marginTop: 16 }}
            title={
              <Space>
                <FileTextOutlined style={{ color: '#722ed1' }} />
                <span>承运商申诉说明</span>
              </Space>
            }
          >
            <p style={{ margin: 0, color: '#595959' }}>{currentWaybill.carrierExplanation}</p>
          </Card>
        )}

        <Card
          size="small"
          style={{ marginTop: 16 }}
          title={
            <Space>
              <SafetyOutlined style={{ color: '#52c41a' }} />
              <span>最终判定</span>
              <span style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 'normal' }}>
                已确认 {riskStats.confirmed}/{riskStats.total} 个风险点
              </span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Radio.Group
              value={finalResult}
              onChange={(e) => setFinalResult(e.target.value)}
              size="large"
            >
              <Radio.Button value="qualified" style={{ padding: '0 24px' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  合格
                </Space>
              </Radio.Button>
              <Radio.Button value="unqualified" style={{ padding: '0 24px' }}>
                <Space>
                  <CloseCircleOutlined style={{ color: '#f5222d' }} />
                  不合格
                </Space>
              </Radio.Button>
            </Radio.Group>

            <div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 6 }}>稽核意见</div>
              <TextArea
                value={auditOpinion}
                onChange={(e) => setAuditOpinion(e.target.value)}
                placeholder="请填写稽核意见，说明判定理由、整改要求等..."
                rows={3}
                maxLength={500}
                showCount
              />
            </div>
          </Space>
        </Card>
      </div>

      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={prevWaybill}
            disabled={reviewWaybillIndex === 0}
          >
            上一单
          </Button>
          <Button
            icon={<ArrowRightOutlined />}
            onClick={() => {
              nextWaybill();
              setFinalResult(null);
              setAuditOpinion('');
            }}
            disabled={reviewWaybillIndex >= selectedWaybills.length - 1}
          >
            下一单
          </Button>
        </Space>
        <Space>
          <Button onClick={handleClose}>退出复核</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.35)'
            }}
          >
            保存并{reviewWaybillIndex >= selectedWaybills.length - 1 ? '完成' : '继续'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
}

function RiskItem({
  risk,
  onConfirm
}: {
  risk: RiskPoint;
  onConfirm: (riskId: string, isQualified: boolean, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(risk.auditorNote || '');

  const severityColor = {
    low: '#faad14',
    medium: '#fa8c16',
    high: '#f5222d'
  }[risk.severity];

  const handleConfirm = (isQualified: boolean) => {
    onConfirm(risk.id, isQualified, note);
  };

  return (
    <List.Item
      style={{
        border: risk.confirmed ? '1px solid #d9f7be' : '1px solid #ffd591',
        borderRadius: '6px',
        marginBottom: 8,
        padding: '8px 12px',
        background: risk.confirmed ? '#f6ffed' : '#fffbe6',
        cursor: 'pointer'
      }}
      onClick={() => setExpanded(!expanded)}
      extra={
        risk.confirmed ? (
          risk.isQualified ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              通过
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              不合格
            </Tag>
          )
        ) : (
          <Badge status="processing" color="#faad14" text="待确认" />
        )
      }
    >
      <List.Item.Meta
        title={
          <Space>
            <Badge color={severityColor} />
            <span style={{ fontWeight: 500 }}>{RISK_TYPE_LABELS[risk.type]}</span>
            <Tag color="default" style={{ margin: 0 }}>
              {SEVERITY_LABELS[risk.severity]}
            </Tag>
          </Space>
        }
        description={
          <div>
            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 2 }}>
              {dayjs(risk.startTime).format('HH:mm')} - {dayjs(risk.endTime).format('HH:mm')}
              <span style={{ marginLeft: 12 }}>持续 {risk.durationMinutes} 分钟</span>
            </div>
            <div style={{ color: '#595959', fontSize: 12 }}>{risk.description}</div>
            {risk.temperatureRange && (
              <div style={{ color: '#fa8c16', fontSize: 12, marginTop: 2 }}>
                温度范围: {risk.temperatureRange.min.toFixed(1)}°C ~ {risk.temperatureRange.max.toFixed(1)}°C
              </div>
            )}
          </div>
        }
      />

      {expanded && !risk.confirmed && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px dashed #d9d9d9'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 6 }}>质控员备注</div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入判定说明..."
            size="small"
            style={{ marginBottom: 8 }}
          />
          <Space>
            <Tooltip title="不构成不合格，予以放行">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(true)}
                style={{ borderColor: '#52c41a', color: '#52c41a' }}
              >
                予以通过
              </Button>
            </Tooltip>
            <Tooltip title="构成不合格，需整改">
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleConfirm(false)}
              >
                判定不合格
              </Button>
            </Tooltip>
          </Space>
        </div>
      )}

      {expanded && risk.confirmed && risk.auditorNote && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px dashed #d9d9d9',
            color: '#595959',
            fontSize: 12
          }}
        >
          <strong>备注：</strong>{risk.auditorNote}
        </div>
      )}
    </List.Item>
  );
}
