import { useState, useEffect } from 'react';
import { Layout, Menu, theme, Avatar, Space, Badge, Typography, Dropdown } from 'antd';
import {
  FileSearchOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { HomePage } from './pages/HomePage';
import { CarrierScorePage } from './components/CarrierScorePage';
import { useAuditStore } from './store/useAuditStore';
import { generateMockWaybills, generateCarrierScores } from './data/mockData';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuKey = 'waybill' | 'score' | 'settings';

function App() {
  const {
    token: { colorBgContainer, colorPrimary, borderRadiusLG }
  } = theme.useToken();

  const [activeKey, setActiveKey] = useState<MenuKey>('waybill');
  const { setWaybills, waybills, setCarrierScores } = useAuditStore();

  useEffect(() => {
    const mockWaybills = generateMockWaybills(60);
    setWaybills(mockWaybills);
    const scores = generateCarrierScores(mockWaybills);
    setCarrierScores(scores);
  }, [setWaybills, setCarrierScores]);

  const pendingReviewCount = waybills.filter(w => w.reviewStatus === 'pending').length;

  const menuItems = [
    {
      key: 'waybill',
      icon: <FileSearchOutlined />,
      label: (
        <Space>
          <span>运单稽核</span>
          {pendingReviewCount > 0 && (
            <Badge count={pendingReviewCount} size="small" color="#faad14" />
          )}
        </Space>
      )
    },
    {
      key: 'score',
      icon: <BarChartOutlined />,
      label: '承运商评分'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '质检规则'
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ];

  const renderContent = () => {
    switch (activeKey) {
      case 'waybill':
        return <HomePage />;
      case 'score':
        return <CarrierScorePage />;
      case 'settings':
        return (
          <div style={{ padding: 24 }}>
            <Content style={{
              background: colorBgContainer,
              padding: 24,
              borderRadius: borderRadiusLG,
              minHeight: 'calc(100vh - 160px)'
            }}>
              <Title level={3} style={{ marginTop: 0 }}>质检判定规则配置</Title>
              <p style={{ color: '#8c8c8c' }}>此处可配置各类风险点的判定阈值和规则</p>
            </Content>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
          padding: '0 24px',
          height: 64
        }}
      >
        <Space size={12}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 22, color: '#fff' }} />
          </div>
          <Space direction="vertical" size={0}>
            <Title
              level={4}
              style={{
                color: '#fff',
                margin: 0,
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 1
              }}
            >
              冷链质量稽核系统
            </Title>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
              Cold Chain Quality Audit System
            </span>
          </Space>
        </Space>

        <Space size={20}>
          <Badge count={pendingReviewCount} size="small" offset={[-2, 2]}>
            <BellOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }} />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.85)' }}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ background: '#1890ff' }}
              />
              <span>质控管理员</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={200}
          style={{
            background: colorBgContainer,
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            onClick={({ key }) => setActiveKey(key as MenuKey)}
            style={{
              height: '100%',
              borderRight: 0,
              paddingTop: 16
            }}
          />
        </Sider>

        <Layout
          style={{
            background: '#f5f7fa',
            overflow: 'auto'
          }}
        >
          <Content style={{ margin: 0, minHeight: 'calc(100vh - 64px)' }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
