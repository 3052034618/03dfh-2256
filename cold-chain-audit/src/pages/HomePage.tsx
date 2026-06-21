import { useState } from 'react';
import { Layout, theme } from 'antd';
import { FilterPanel } from '../components/FilterPanel';
import { WaybillTable } from '../components/WaybillTable';
import { ReviewWindow } from '../components/ReviewWindow';
import { useAuditStore } from '../store/useAuditStore';
import type { Waybill } from '../types';

const { Content } = Layout;

export function HomePage() {
  const { token } = theme.useToken();
  const { isReviewMode, getSelectedWaybillObjects, setCurrentWaybill, enterReviewMode } = useAuditStore();
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewDetail = (waybill: Waybill) => {
    setCurrentWaybill(waybill);
    useAuditStore.setState({ selectedWaybills: [waybill.id], reviewWaybillIndex: 0 });
    enterReviewMode();
    setDetailModalOpen(true);
  };

  const selectedObjects = getSelectedWaybillObjects();
  const firstSelected = selectedObjects[0] || null;

  return (
    <Layout style={{ background: token.colorBgLayout }}>
      <Content style={{ padding: 24 }}>
        <FilterPanel />
        <div style={{ marginTop: 16 }}>
          <WaybillTable onViewDetail={handleViewDetail} />
        </div>
      </Content>

      <ReviewWindow
        open={isReviewMode}
        onClose={() => {
          useAuditStore.getState().exitReviewMode();
          setDetailModalOpen(false);
        }}
      />
    </Layout>
  );
}
