import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from '@/components/Layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import BetDetails from '@/pages/BetDetails';
import DailyStats from '@/pages/DailyStats';
import GroupOdds from '@/pages/GroupOdds';
import useUserStore from '@/store/useUserStore';

// 私有路由守卫
const PrivateRoute = ({ children }) => {
  const { token } = useUserStore();
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bets" element={<BetDetails />} />
            <Route path="stats" element={<DailyStats />} />
            <Route path="odds" element={<GroupOdds />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

