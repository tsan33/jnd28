import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import useUserStore from '@/store/useUserStore';
import useMetaStore from '@/store/useMetaStore';
import './MainLayout.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const { fetchMeta } = useMetaStore();

  // 初始化元数据
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  // 菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '概览',
    },
    {
      key: '/bets',
      icon: <UnorderedListOutlined />,
      label: '投注明细',
    },
    {
      key: '/stats',
      icon: <BarChartOutlined />,
      label: '日统计',
    },
    {
      key: '/odds',
      icon: <SettingOutlined />,
      label: '群与赔率',
    },
  ];

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-left">
          <div className="logo">加拿大28投注</div>
        </div>
        <div className="header-right">
          <Space size="large">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info" style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text style={{ color: '#fff' }}>
                  {userInfo?.username || '用户'}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="main-sider">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout className="main-content-layout">
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

