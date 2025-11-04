import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 默认时区（伊斯坦布尔）
export const DEFAULT_TIMEZONE = 'Europe/Istanbul';

/**
 * 格式化金额，保留2位小数
 */
export const formatAmount = (amount, decimals = 2) => {
  if (!amount && amount !== 0) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
};

/**
 * 格式化赔率，保留4位小数
 */
export const formatOdds = (odds, decimals = 4) => {
  if (!odds && odds !== 0) return '-';
  const num = typeof odds === 'string' ? parseFloat(odds) : odds;
  return num.toFixed(decimals);
};

/**
 * 格式化时间（本地化显示）
 */
export const formatDateTime = (dateStr, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateStr) return '-';
  return dayjs(dateStr).tz(DEFAULT_TIMEZONE).format(format);
};

/**
 * 格式化UTC时间（用于tooltip）
 */
export const formatUTCTime = (dateStr, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateStr) return '-';
  return dayjs(dateStr).utc().format(format) + ' UTC';
};

/**
 * 获取日期范围（默认近N天）
 */
export const getDefaultDateRange = (days = 7) => {
  const end = dayjs().tz(DEFAULT_TIMEZONE).endOf('day');
  const start = end.subtract(days - 1, 'day').startOf('day');
  return [start, end];
};

/**
 * 导出CSV文件
 */
export const downloadCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 校验赔率范围
 */
export const validateOdds = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '请输入有效数字';
  if (num < 1.01) return '赔率不能小于1.0100';
  if (num > 100) return '赔率不能大于100.0000';
  return null;
};

/**
 * 获取投注状态标签颜色
 */
export const getBetStatusColor = (status) => {
  const colorMap = {
    0: 'processing', // 待结算
    1: 'success',    // 已中奖
    2: 'default',    // 未中奖
    3: 'error',      // 撤单
  };
  return colorMap[status] || 'default';
};

