import React from 'react';
import { Card, Row, Col, Statistic, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './index.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <Alert
        message="欢迎使用加拿大28投注用户后台"
        description="这里是系统概览页面，您可以通过左侧菜单访问投注明细、日统计和赔率管理等功能。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日投注额"
              value={11280.50}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix="¥"
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日派发额"
              value={10540.30}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日盈亏"
              value={740.20}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix="¥"
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日注单数"
              value={1234}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="快速访问">
            <ul className="quick-links">
              <li><a href="/bets">查看投注明细</a></li>
              <li><a href="/stats">查看日统计</a></li>
              <li><a href="/odds">管理群赔率</a></li>
            </ul>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系统公告">
            <ul className="notices">
              <li>系统将于本周日凌晨2:00-4:00进行维护升级</li>
              <li>新增数据导出功能，支持导出CSV格式</li>
              <li>优化赔率管理界面，支持批量编辑</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

