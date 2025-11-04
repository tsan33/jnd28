import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Empty,
  Tooltip,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { getBets, exportBets } from '@/services/api';
import useMetaStore from '@/store/useMetaStore';
import TimeTooltip from '@/components/TimeTooltip';
import ExportButton from '@/components/ExportButton';
import {
  formatAmount,
  getDefaultDateRange,
  getBetStatusColor,
  downloadCSV,
} from '@/utils/format';
import './index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BetDetails = () => {
  const [form] = Form.useForm();
  const { groups, playTypes, betStatus, getPlayName, getBetStatusLabel } = useMetaStore();

  // 筛选条件
  const [filters, setFilters] = useState({
    group_ids: [],
    play_codes: [],
    status: undefined,
    issue_no: '',
    player_id: '',
    time_from: getDefaultDateRange(7)[0].toISOString(),
    time_to: getDefaultDateRange(7)[1].toISOString(),
    page: 1,
    page_size: 20,
    order_by: 'created_at',
    order_dir: 'desc',
  });

  // 获取投注数据
  const { data, loading, run } = useRequest(
    () => getBets(filters),
    {
      refreshDeps: [filters],
    }
  );

  // 初始化表单
  useEffect(() => {
    form.setFieldsValue({
      date_range: getDefaultDateRange(7),
    });
  }, [form]);

  // 搜索
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const [startDate, endDate] = values.date_range || [];

    setFilters({
      ...filters,
      group_ids: values.group_ids || [],
      play_codes: values.play_codes || [],
      status: values.status,
      issue_no: values.issue_no || '',
      player_id: values.player_id || '',
      time_from: startDate ? startDate.toISOString() : undefined,
      time_to: endDate ? endDate.toISOString() : undefined,
      page: 1,
    });
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({
      date_range: getDefaultDateRange(7),
    });
    setFilters({
      ...filters,
      group_ids: [],
      play_codes: [],
      status: undefined,
      issue_no: '',
      player_id: '',
      time_from: getDefaultDateRange(7)[0].toISOString(),
      time_to: getDefaultDateRange(7)[1].toISOString(),
      page: 1,
    });
  };

  // 导出
  const handleExport = async () => {
    const blob = await exportBets(filters);
    const filename = `投注明细_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    downloadCSV(blob, filename);
  };

  // 表格列定义
  const columns = [
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => <TimeTooltip time={text} />,
    },
    {
      title: '玩家ID',
      dataIndex: 'player_id',
      key: 'player_id',
      width: 120,
    },
    {
      title: '期号',
      dataIndex: 'issue_no',
      key: 'issue_no',
      width: 150,
    },
    {
      title: '群组',
      dataIndex: 'group_name',
      key: 'group_name',
      width: 120,
    },
    {
      title: '玩法',
      dataIndex: 'play_code',
      key: 'play_code',
      width: 100,
      render: (text, record) => record.play_name || getPlayName(text),
    },
    {
      title: '投注额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (text) => formatAmount(text),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Tag color={getBetStatusColor(status)}>
          {record.status_label || getBetStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '派发金额',
      dataIndex: 'payout_amount',
      key: 'payout_amount',
      width: 120,
      align: 'right',
      render: (text) => formatAmount(text),
    },
    {
      title: '盈利',
      dataIndex: 'profit_amount',
      key: 'profit_amount',
      width: 120,
      align: 'right',
      render: (text) => (
        <span style={{ color: parseFloat(text) > 0 ? '#52c41a' : undefined }}>
          {formatAmount(text)}
        </span>
      ),
    },
  ];

  // 分页配置
  const paginationConfig = {
    current: filters.page,
    pageSize: filters.page_size,
    total: data?.total || 0,
    showSizeChanger: true,
    pageSizeOptions: [20, 50, 100],
    showTotal: (total) => `共 ${total} 条记录`,
    onChange: (page, pageSize) => {
      setFilters({ ...filters, page, page_size: pageSize });
    },
  };

  return (
    <div className="bet-details-page">
      <Card>
        <Form form={form} layout="inline" className="filter-form">
          <Form.Item name="group_ids" label="群组">
            <Select
              mode="multiple"
              placeholder="请选择群组"
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

          <Form.Item name="play_codes" label="玩法">
            <Select
              mode="multiple"
              placeholder="请选择玩法"
              style={{ width: 200 }}
              maxTagCount="responsive"
              allowClear
            >
              {playTypes.map((play) => (
                <Option key={play.code} value={play.code}>
                  {play.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              {Object.entries(betStatus).map(([value, label]) => (
                <Option key={value} value={parseInt(value)}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date_range" label="时间范围">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: 360 }}
            />
          </Form.Item>

          <Form.Item name="issue_no" label="期号">
            <Input placeholder="请输入期号" style={{ width: 150 }} />
          </Form.Item>

          <Form.Item name="player_id" label="玩家ID">
            <Input placeholder="请输入玩家ID" style={{ width: 150 }} />
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
              <ExportButton
                onExport={handleExport}
                filters={filters}
                estimatedRows={data?.total}
              />
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data?.list || []}
          rowKey="bet_id"
          loading={loading}
          pagination={paginationConfig}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                description="无符合记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="link" onClick={handleReset}>
                  清空筛选
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default BetDetails;

