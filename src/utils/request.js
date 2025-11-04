import axios from 'axios';
import { message } from 'antd';

// 错误码映射
const ERROR_MESSAGES = {
  0: '成功',
  40100: '未登录或token失效，请重新登录',
  40301: '无权限访问该群组',
  42201: '无效的玩法编码',
  42202: '赔率超出范围',
  42203: '时间范围无效（最大90天）',
  42204: '分页参数过大',
  42900: '请求过于频繁，请稍后再试',
  50000: '服务器内部错误',
};

// 创建axios实例
const request = axios.create({
  baseURL: '/user',
  timeout: 30000,
  withCredentials: true,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data;
    
    // 成功响应
    if (code === 0) {
      return data;
    }
    
    // 业务错误
    const errorMsg = ERROR_MESSAGES[code] || msg || '请求失败';
    message.error(errorMsg);
    
    // 未登录，跳转登录页
    if (code === 40100) {
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    
    return Promise.reject(new Error(errorMsg));
  },
  (error) => {
    // 网络错误
    if (error.message.includes('timeout')) {
      message.error('请求超时，请稍后重试');
    } else if (error.message.includes('Network Error')) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;

