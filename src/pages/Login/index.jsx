import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 模拟登录请求
      // 实际应该调用登录API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 设置用户信息和token
      setUser(
        {
          username: values.username,
          userId: '10001',
        },
        'mock-token-' + Date.now()
      );
      
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" title="加拿大28投注 - 用户登录">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

