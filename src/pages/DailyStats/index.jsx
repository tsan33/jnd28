import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Row,
  Col,
  Statistic,
  Switch,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { getDailyStats, exportBets } from '@/services/api';
import useMetaStore from '@/store/useMetaStore';
import ExportButton from '@/components/ExportButton';
import {
  formatAmount,
  getDefaultDateRange,
  downloadCSV,
} from '@/utils/format';
import './index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DailyStats = () => {
  const [form] = Form.useForm();
  const { groups } = useMetaStore();

  // 筛选条件
  const [filters, setFilters] = useState({
    group_ids: [],
    time_from: getDefaultDateRange(7)[0].toISOString(),
    time_to: getDefaultDateRange(7)[1].toISOString(),
    merge_groups: false,
  });

  // 获取统计数据
  const { data, loading, run } = useRequest(
    () => getDailyStats(filters),
    {
      refreshDeps: [filters],
    }
  );

  // 初始化表单
  useEffect(() => {
    form.setFieldsValue({
      date_range: getDefaultDateRange(7),
      merge_groups: false,
    });
  }, [form]);

  // 搜索
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.date_range || [];

    setFilters({
      group_ids: values.group_ids || [],
      time_from: startDate ? startDate.toISOString() : undefined,
      time_to: endDate ? endDate.toISOString() : undefined,
      merge_groups: values.merge_groups || false,
    });
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({
      date_range: getDefaultDateRange(7),
      merge_groups: false,
    });
    setFilters({
      group_ids: [],
      time_from: getDefaultDateRange(7)[0].toISOString(),
      time_to: getDefaultDateRange(7)[1].toISOString(),
      merge_groups: false,
    });
  };

  // 导出
  const handleExport = async () => {
    // 导出统计数据（这里使用同样的导出接口，实际可能需要单独的统计导出接口）
    const blob = await exportBets(filters);
    const filename = `日统计_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    downloadCSV(blob, filename);
  };

  // 准备图表数据
  const chartData = React.useMemo(() => {
    if (!data?.items) return [];
    
    // 按日期分组
    const grouped = {};
    data.items.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = {
          date: item.date,
          bet_amount: 0,
          profit: 0,
        };
      }
      grouped[item.date].bet_amount += parseFloat(item.bet_amount || 0);
      grouped[item.date].profit += parseFloat(item.profit || 0);
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // 表格列定义
  const columns = filters.merge_groups
    ? [
        {
          title: '日期',
          dataIndex: 'date',
          key: 'date',
          width: 120,
        },
        {
          title: '投注额',
          dataIndex: 'bet_amount',
          key: 'bet_amount',
          width: 150,
          align: 'right',
          render: (text) => formatAmount(text),
        },
        {
          title: '派发额',
          dataIndex: 'payout_total',
          key: 'payout_total',
          width: 150,
          align: 'right',
          render: (text) => formatAmount(text),
        },
        {
          title: '盈亏',
          dataIndex: 'profit',
          key: 'profit',
          width: 150,
          align: 'right',
          render: (text) => (
            <span
              style={{
                color: parseFloat(text) > 0 ? '#52c41a' : parseFloat(text) < 0 ? '#ff4d4f' : undefined,
              }}
            >
              {formatAmount(text)}
            </span>
          ),
        },
      ]
    : [
        {
          title: '日期',
          dataIndex: 'date',
          key: 'date',
          width: 120,
        },
        {
          title: '群组',
          dataIndex: 'group_name',
          key: 'group_name',
          width: 120,
        },
        {
          title: '投注额',
          dataIndex: 'bet_amount',
          key: 'bet_amount',
          width: 150,
          align: 'right',
          render: (text) => formatAmount(text),
        },
        {
          title: '派发额',
          dataIndex: 'payout_total',
          key: 'payout_total',
          width: 150,
          align: 'right',
          render: (text) => formatAmount(text),
        },
        {
          title: '盈亏',
          dataIndex: 'profit',
          key: 'profit',
          width: 150,
          align: 'right',
          render: (text) => (
            <span
              style={{
                color: parseFloat(text) > 0 ? '#52c41a' : parseFloat(text) < 0 ? '#ff4d4f' : undefined,
              }}
            >
              {formatAmount(text)}
            </span>
          ),
        },
      ];

  return (
    <div className="daily-stats-page">
      <Card>
        <Form form={form} layout="inline" className="filter-form">
          <Form.Item name="group_ids" label="群组">
            <Select
              mode="multiple"
              placeholder="全部授权群"
              style={{ width: 200 }}
              maxTagCount="responsive"
              allowClear
            >
              {groups.map((group) => (
                <Option key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date_range" label="时间范围">
            <RangePicker
              format="YYYY-MM-DD"
              style={{ width: 260 }}
              presets={[
                { label: '近7天', value: getDefaultDateRange(7) },
                { label: '近30天', value: getDefaultDateRange(30) },
                { label: '近90天', value: getDefaultDateRange(90) },
              ]}
            />
          </Form.Item>

          <Form.Item name="merge_groups" label="合并群组" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <ExportButton onExport={handleExport} filters={filters} />
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 汇总卡片 */}
      <Card style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="总投注额"
              value={formatAmount(data?.summary?.bet_amount || 0)}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="总派发额"
              value={formatAmount(data?.summary?.payout_total || 0)}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="总盈亏"
              value={formatAmount(data?.summary?.profit || 0)}
              precision={2}
              valueStyle={{
                color:
                  parseFloat(data?.summary?.profit || 0) > 0
                    ? '#3f8600'
                    : parseFloat(data?.summary?.profit || 0) < 0
                    ? '#cf1322'
                    : undefined,
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* 图表 */}
      <Card title="投注趋势" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bet_amount"
              stroke="#1890ff"
              name="投注额"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="盈亏趋势" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#52c41a"
              name="盈亏"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 详细表格 */}
      <Card title="详细数据" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey={(record, index) => `${record.date}_${record.group_id || index}`}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DailyStats;

