import request from '@/utils/request';
import {
  mockMeta,
  generateMockBets,
  generateMockDailyStats,
  generateMockOdds,
} from './mockData';

// 是否使用Mock数据（开发演示用）
const USE_MOCK = true;

/**
 * 获取元数据（枚举、字典、授权群）
 */
export const getMeta = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockMeta);
  }
  return request.get('/meta');
};

/**
 * 获取投注明细列表
 */
export const getBets = (params) => {
  if (USE_MOCK) {
    const allBets = generateMockBets(200);
    let filteredBets = [...allBets];
    
    // 按群组筛选
    if (params.group_ids && params.group_ids.length > 0) {
      filteredBets = filteredBets.filter(bet => params.group_ids.includes(bet.group_id));
    }
    
    // 按玩法筛选
    if (params.play_codes && params.play_codes.length > 0) {
      filteredBets = filteredBets.filter(bet => params.play_codes.includes(bet.play_code));
    }
    
    // 按状态筛选
    if (params.status !== undefined && params.status !== null) {
      filteredBets = filteredBets.filter(bet => bet.status === params.status);
    }
    
    // 按期号筛选
    if (params.issue_no) {
      filteredBets = filteredBets.filter(bet => bet.issue_no.includes(params.issue_no));
    }
    
    // 按玩家ID筛选
    if (params.player_id) {
      filteredBets = filteredBets.filter(bet => bet.player_id.includes(params.player_id));
    }
    
    // 按时间筛选
    if (params.time_from) {
      const timeFrom = new Date(params.time_from);
      filteredBets = filteredBets.filter(bet => new Date(bet.created_at) >= timeFrom);
    }
    if (params.time_to) {
      const timeTo = new Date(params.time_to);
      filteredBets = filteredBets.filter(bet => new Date(bet.created_at) <= timeTo);
    }
    
    // 分页
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return Promise.resolve({
      total: filteredBets.length,
      list: filteredBets.slice(start, end),
      page: page,
      page_size: pageSize,
    });
  }
  return request.get('/bets', { params });
};

/**
 * 导出投注明细
 */
export const exportBets = (params) => {
  if (USE_MOCK) {
    // 生成CSV内容
    const bets = generateMockBets(100);
    const headers = ['下单时间', '玩家ID', '期号', '群组', '玩法', '投注额', '状态', '派发金额', '盈利'];
    const rows = bets.map(bet => [
      bet.created_at,
      bet.player_id,
      bet.issue_no,
      bet.group_name,
      bet.play_name,
      bet.amount,
      bet.status_label,
      bet.payout_amount,
      bet.profit_amount,
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    return Promise.resolve(blob);
  }
  return request.get('/bets/export', {
    params,
    responseType: 'blob',
  });
};

/**
 * 获取日统计数据
 */
export const getDailyStats = (params) => {
  if (USE_MOCK) {
    let items = generateMockDailyStats(30);
    
    // 按群组筛选
    if (params.group_ids && params.group_ids.length > 0) {
      items = items.filter(item => params.group_ids.includes(item.group_id));
    }
    
    // 按时间筛选
    if (params.time_from) {
      const timeFrom = params.time_from.split('T')[0];
      items = items.filter(item => item.date >= timeFrom);
    }
    if (params.time_to) {
      const timeTo = params.time_to.split('T')[0];
      items = items.filter(item => item.date <= timeTo);
    }
    
    // 合并群组
    if (params.merge_groups) {
      const grouped = {};
      items.forEach(item => {
        if (!grouped[item.date]) {
          grouped[item.date] = {
            date: item.date,
            bet_amount: 0,
            payout_total: 0,
            profit: 0,
          };
        }
        grouped[item.date].bet_amount = (parseFloat(grouped[item.date].bet_amount) + parseFloat(item.bet_amount)).toFixed(6);
        grouped[item.date].payout_total = (parseFloat(grouped[item.date].payout_total) + parseFloat(item.payout_total)).toFixed(6);
        grouped[item.date].profit = (parseFloat(grouped[item.date].profit) + parseFloat(item.profit)).toFixed(6);
      });
      items = Object.values(grouped);
    }
    
    // 计算汇总
    const summary = {
      bet_amount: items.reduce((sum, item) => sum + parseFloat(item.bet_amount), 0).toFixed(6),
      payout_total: items.reduce((sum, item) => sum + parseFloat(item.payout_total), 0).toFixed(6),
      profit: items.reduce((sum, item) => sum + parseFloat(item.profit), 0).toFixed(6),
    };
    
    return Promise.resolve({
      items: items,
      summary: summary,
    });
  }
  return request.get('/stats/daily', { params });
};

/**
 * 获取群赔率配置
 */
export const getGroupOdds = (groupId) => {
  if (USE_MOCK) {
    return Promise.resolve(generateMockOdds(groupId));
  }
  return request.get('/odds', { params: { group_id: groupId } });
};

/**
 * 保存群赔率配置
 */
export const setGroupOdds = (data) => {
  if (USE_MOCK) {
    // 模拟保存成功
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          updated: data.items.length,
        });
      }, 500);
    });
  }
  return request.post('/odds/set', data);
};

