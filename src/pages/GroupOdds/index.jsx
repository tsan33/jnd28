import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Input,
  Table,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Modal,
  Typography,
  Tabs,
  Select,
  Form,
} from 'antd';
import { SaveOutlined, ReloadOutlined, ExclamationCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getGroupOdds, setGroupOdds } from '@/services/api';
import useMetaStore from '@/store/useMetaStore';
import TimeTooltip from '@/components/TimeTooltip';
import { formatOdds, validateOdds } from '@/utils/format';
import './index.css';

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const GroupOdds = () => {
  const { groups, playTypes } = useMetaStore();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [editedItems, setEditedItems] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('normal');
  
  // 特殊赔率规则
  const [specialRules, setSpecialRules] = useState([
    { id: 1, result: 13, playCode: 'SMALL', condition: '>', amount: 10000, odd: 2.1 },
    { id: 2, result: 13, playCode: 'SMALL', condition: '>', amount: 50000, odd: 2.3 },
    { id: 3, result: 13, playCode: 'SMALL', condition: '>', amount: 100000, odd: 2.5 },
    { id: 4, result: 13, playCode: 'SMALL_ODD', condition: '>', amount: 10000, odd: 4.2 },
    { id: 5, result: 13, playCode: 'SMALL_ODD', condition: '>', amount: 50000, odd: 4.5 },
    { id: 6, result: 13, playCode: 'SMALL_ODD', condition: '>', amount: 100000, odd: 4.8 },
    { id: 7, result: 14, playCode: 'BIG', condition: '>', amount: 10000, odd: 2.1 },
    { id: 8, result: 14, playCode: 'BIG', condition: '>', amount: 50000, odd: 2.3 },
    { id: 9, result: 14, playCode: 'BIG', condition: '>', amount: 100000, odd: 2.5 },
    { id: 10, result: 14, playCode: 'BIG_EVEN', condition: '>', amount: 10000, odd: 4.2 },
    { id: 11, result: 14, playCode: 'BIG_EVEN', condition: '>', amount: 50000, odd: 4.5 },
    { id: 12, result: 14, playCode: 'BIG_EVEN', condition: '>', amount: 100000, odd: 4.8 },
  ]);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm] = Form.useForm();

  // 获取赔率配置
  const {
    data: oddsData,
    loading,
    run: fetchOdds,
  } = useRequest((groupId) => getGroupOdds(groupId), {
    manual: true,
  });

  // 保存赔率
  const { loading: saving, run: saveOdds } = useRequest(
    (data) => setGroupOdds(data),
    {
      manual: true,
      onSuccess: (result) => {
        message.success(`保存成功，已更新 ${result.updated} 项配置`);
        setEditedItems({});
        setHasChanges(false);
        if (selectedGroup) {
          fetchOdds(selectedGroup.group_id);
        }
      },
    }
  );

  // 选择群组时加载赔率
  useEffect(() => {
    if (selectedGroup) {
      fetchOdds(selectedGroup.group_id);
    }
  }, [selectedGroup, fetchOdds]);

  // 默认选择第一个群组
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // 过滤群组列表
  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 切换群组（检查未保存变更）
  const handleGroupChange = (group) => {
    if (hasChanges) {
      Modal.confirm({
        title: '存在未保存的变更',
        icon: <ExclamationCircleOutlined />,
        content: '切换群组将丢失当前未保存的变更，是否继续？',
        onOk: () => {
          setSelectedGroup(group);
          setEditedItems({});
          setHasChanges(false);
        },
      });
    } else {
      setSelectedGroup(group);
      setEditedItems({});
    }
  };

  // 修改赔率
  const handleOddsChange = (playCode, field, value) => {
    const key = playCode;
    setEditedItems({
      ...editedItems,
      [key]: {
        ...editedItems[key],
        play_code: playCode,
        [field]: value,
      },
    });
    setHasChanges(true);
  };

  // 保存所有变更
  const handleSaveAll = () => {
    // 校验所有赔率
    const items = Object.values(editedItems);
    for (const item of items) {
      if (item.odd !== undefined) {
        const error = validateOdds(item.odd);
        if (error) {
          message.error(`玩法 ${item.play_code}: ${error}`);
          return;
        }
      }
    }

    Modal.confirm({
      title: '确认保存',
      icon: <ExclamationCircleOutlined />,
      content: `即将保存 ${items.length} 项赔率变更，是否继续？`,
      onOk: () => {
        saveOdds({
          group_id: selectedGroup.group_id,
          items: items.map((item) => ({
            play_code: item.play_code,
            odd: item.odd !== undefined ? formatOdds(item.odd) : undefined,
            status: item.status !== undefined ? item.status : undefined,
          })),
        });
      },
    });
  };

  // 取消变更
  const handleCancelAll = () => {
    Modal.confirm({
      title: '确认取消',
      content: '将丢失所有未保存的变更，是否继续？',
      onOk: () => {
        setEditedItems({});
        setHasChanges(false);
      },
    });
  };

  // 重置单行
  const handleResetRow = (playCode) => {
    const newEditedItems = { ...editedItems };
    delete newEditedItems[playCode];
    setEditedItems(newEditedItems);
    setHasChanges(Object.keys(newEditedItems).length > 0);
  };

  // 合并原始数据和编辑数据
  const tableData = React.useMemo(() => {
    if (!oddsData?.items) return [];
    
    return oddsData.items.map((item) => {
      const edited = editedItems[item.play_code];
      return {
        ...item,
        odd: edited?.odd !== undefined ? edited.odd : item.odd,
        status: edited?.status !== undefined ? edited.status : item.status,
        isEdited: !!edited,
      };
    });
  }, [oddsData, editedItems]);

  // 表格列定义
  const columns = [
    {
      title: '玩法编码',
      dataIndex: 'play_code',
      key: 'play_code',
      width: 120,
    },
    {
      title: '玩法名称',
      dataIndex: 'play_name',
      key: 'play_name',
      width: 120,
    },
    {
      title: '赔率',
      dataIndex: 'odd',
      key: 'odd',
      width: 180,
      render: (value, record) => (
        <InputNumber
          value={parseFloat(value)}
          onChange={(val) => handleOddsChange(record.play_code, 'odd', val)}
          precision={4}
          min={1.01}
          max={100}
          step={0.01}
          style={{
            width: '100%',
            borderColor: record.isEdited ? '#1890ff' : undefined,
          }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value, record) => (
        <Switch
          checked={value === 1}
          onChange={(checked) =>
            handleOddsChange(record.play_code, 'status', checked ? 1 : 0)
          }
        />
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text) => <TimeTooltip time={text} />,
    },
    {
      title: '更新人',
      dataIndex: 'updated_by_name',
      key: 'updated_by_name',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) =>
        record.isEdited ? (
          <Button
            type="link"
            size="small"
            onClick={() => handleResetRow(record.play_code)}
          >
            重置
          </Button>
        ) : null,
    },
  ];

  // 特殊赔率规则列定义
  const specialRuleColumns = [
    {
      title: '开奖结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
    },
    {
      title: '投注玩法',
      dataIndex: 'playCode',
      key: 'playCode',
      width: 120,
      render: (code) => {
        const play = playTypes.find(p => p.code === code);
        return play ? play.name : code;
      },
    },
    {
      title: '总下注条件',
      key: 'condition',
      width: 200,
      render: (_, record) => `${record.condition} ¥${record.amount.toLocaleString()}`,
    },
    {
      title: '赔率',
      dataIndex: 'odd',
      key: 'odd',
      width: 120,
      render: (val) => val.toFixed(4),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingRule(record);
              ruleForm.setFieldsValue(record);
              setRuleModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这条规则吗？',
                onOk: () => {
                  setSpecialRules(specialRules.filter(r => r.id !== record.id));
                  message.success('删除成功');
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 保存特殊规则
  const handleSaveRule = () => {
    ruleForm.validateFields().then(values => {
      if (editingRule) {
        // 编辑
        setSpecialRules(specialRules.map(r => r.id === editingRule.id ? { ...values, id: r.id } : r));
        message.success('修改成功');
      } else {
        // 新增
        const newRule = { ...values, id: Date.now() };
        setSpecialRules([...specialRules, newRule]);
        message.success('添加成功');
      }
      setRuleModalVisible(false);
      setEditingRule(null);
      ruleForm.resetFields();
    });
  };

  return (
    <div className="group-odds-page">
      <Row gutter={16}>
        {/* 左侧群组列表 */}
        <Col span={6}>
          <Card title="群组列表" bodyStyle={{ padding: 0 }}>
            <div style={{ padding: 16 }}>
              <Search
                placeholder="搜索群组"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <List
              dataSource={filteredGroups}
              renderItem={(group) => (
                <List.Item
                  className={
                    selectedGroup?.group_id === group.group_id
                      ? 'group-item active'
                      : 'group-item'
                  }
                  onClick={() => handleGroupChange(group)}
                  style={{ cursor: 'pointer', padding: '12px 16px' }}
                >
                  <Text>{group.group_name}</Text>
                </List.Item>
              )}
              style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}
            />
          </Card>
        </Col>

        {/* 右侧赔率配置 */}
        <Col span={18}>
          <Card
            title={
              selectedGroup
                ? `${selectedGroup.group_name} - 赔率配置`
                : '请选择群组'
            }
            extra={
              activeTab === 'normal' && hasChanges && (
                <Space>
                  <Button onClick={handleCancelAll}>取消变更</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSaveAll}
                  >
                    保存全部变更
                  </Button>
                </Space>
              )
            }
          >
            {selectedGroup ? (
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="普通赔率" key="normal">
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey="play_code"
                    loading={loading}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 420px)' }}
                    rowClassName={(record) =>
                      record.isEdited ? 'edited-row' : ''
                    }
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="特殊赔率" key="special">
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingRule(null);
                        ruleForm.resetFields();
                        setRuleModalVisible(true);
                      }}
                    >
                      添加规则
                    </Button>
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      特殊赔率规则：根据开奖结果和总投注额动态调整赔率
                    </Text>
                  </div>
                  <Table
                    columns={specialRuleColumns}
                    dataSource={specialRules}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 480px)' }}
                  />
                </Tabs.TabPane>
              </Tabs>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">请从左侧选择一个群组</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 特殊规则编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑特殊赔率规则' : '添加特殊赔率规则'}
        open={ruleModalVisible}
        onOk={handleSaveRule}
        onCancel={() => {
          setRuleModalVisible(false);
          setEditingRule(null);
          ruleForm.resetFields();
        }}
        width={600}
      >
        <Form form={ruleForm} layout="vertical">
          <Form.Item
            label="开奖结果"
            name="result"
            rules={[{ required: true, message: '请输入开奖结果' }]}
          >
            <InputNumber
              min={0}
              max={27}
              placeholder="0-27"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label="投注玩法"
            name="playCode"
            rules={[{ required: true, message: '请选择投注玩法' }]}
          >
            <Select placeholder="请选择玩法">
              {playTypes.map(play => (
                <Option key={play.code} value={play.code}>
                  {play.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="总下注条件"
            name="condition"
            initialValue=">"
            rules={[{ required: true, message: '请选择条件' }]}
          >
            <Select style={{ width: 100 }}>
              <Option value=">">大于</Option>
              <Option value=">=">大于等于</Option>
              <Option value="=">等于</Option>
              <Option value="<">小于</Option>
              <Option value="<=">小于等于</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="金额阈值"
            name="amount"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              min={0}
              prefix="¥"
              placeholder="输入金额"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label="特殊赔率"
            name="odd"
            rules={[
              { required: true, message: '请输入赔率' },
              {
                validator: (_, value) => {
                  const error = validateOdds(value);
                  return error ? Promise.reject(error) : Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1.01}
              max={100}
              step={0.01}
              precision={4}
              placeholder="1.0100 - 100.0000"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <div style={{ padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
            <Text type="secondary">
              <strong>规则说明：</strong><br />
              当开奖结果符合设定值，且该玩法的总投注额满足条件时，使用此特殊赔率进行派发。<br />
              例如：开奖13，投注"小"总额 {'>'} 10000元时，赔率为2.1
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupOdds;

