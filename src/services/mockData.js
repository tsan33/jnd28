/**
 * Mock数据 - 用于演示
 */

// 群组数据
export const mockGroups = [
  { group_id: 20011, group_name: 'VIP群A' },
  { group_id: 20012, group_name: '高级群B' },
  { group_id: 20013, group_name: '普通群C' },
  { group_id: 20014, group_name: '测试群D' },
];

// 玩法数据
export const mockPlayTypes = [
  { code: 'BIG', name: '大' },
  { code: 'SMALL', name: '小' },
  { code: 'ODD', name: '单' },
  { code: 'EVEN', name: '双' },
  { code: 'BIG_ODD', name: '大单' },
  { code: 'BIG_EVEN', name: '大双' },
  { code: 'SMALL_ODD', name: '小单' },
  { code: 'SMALL_EVEN', name: '小双' },
  { code: 'EXTREME_BIG', name: '极大' },
  { code: 'EXTREME_SMALL', name: '极小' },
  { code: 'PAIR', name: '对子' },
  { code: 'STRAIGHT', name: '顺子' },
  { code: 'LEOPARD', name: '豹子' },
  { code: 'NUM_0', name: '0' },
  { code: 'NUM_1', name: '1' },
  { code: 'NUM_2', name: '2' },
  { code: 'NUM_3', name: '3' },
  { code: 'NUM_4', name: '4' },
  { code: 'NUM_5', name: '5' },
  { code: 'NUM_6', name: '6' },
  { code: 'NUM_7', name: '7' },
  { code: 'NUM_8', name: '8' },
  { code: 'NUM_9', name: '9' },
  { code: 'NUM_10', name: '10' },
  { code: 'NUM_11', name: '11' },
  { code: 'NUM_12', name: '12' },
  { code: 'NUM_13', name: '13' },
  { code: 'NUM_14', name: '14' },
  { code: 'NUM_15', name: '15' },
  { code: 'NUM_16', name: '16' },
  { code: 'NUM_17', name: '17' },
  { code: 'NUM_18', name: '18' },
  { code: 'NUM_19', name: '19' },
  { code: 'NUM_20', name: '20' },
  { code: 'NUM_21', name: '21' },
  { code: 'NUM_22', name: '22' },
  { code: 'NUM_23', name: '23' },
  { code: 'NUM_24', name: '24' },
  { code: 'NUM_25', name: '25' },
  { code: 'NUM_26', name: '26' },
  { code: 'NUM_27', name: '27' },
];

// 投注状态
export const mockBetStatus = {
  0: '待结算',
  1: '已中奖',
  2: '未中奖',
  3: '撤单',
};

// 生成随机投注记录
export const generateMockBets = (count = 50) => {
  const bets = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const groupId = mockGroups[Math.floor(Math.random() * mockGroups.length)].group_id;
    const playType = mockPlayTypes[Math.floor(Math.random() * mockPlayTypes.length)];
    const status = Math.floor(Math.random() * 4);
    const amount = (Math.random() * 900 + 100).toFixed(6); // 100-1000
    const odd = status === 1 ? (Math.random() * 3 + 1.5).toFixed(4) : '0.0000';
    const payoutAmount = status === 1 ? (parseFloat(amount) * parseFloat(odd)).toFixed(6) : '0.000000';
    const profitAmount = status === 1 ? (parseFloat(payoutAmount) - parseFloat(amount)).toFixed(6) : '0.000000';
    
    const date = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000); // 最近30天
    const issueNo = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 500)).padStart(3, '0')}`;
    
    // 生成玩家ID
    const playerId = `P${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`;
    
    bets.push({
      bet_id: 100000 + i,
      player_id: playerId,
      created_at: date.toISOString(),
      issue_no: issueNo,
      group_id: groupId,
      group_name: mockGroups.find(g => g.group_id === groupId).group_name,
      play_code: playType.code,
      play_name: playType.name,
      amount: amount,
      status: status,
      status_label: mockBetStatus[status],
      payout_amount: payoutAmount,
      profit_amount: profitAmount,
    });
  }
  
  return bets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// 生成日统计数据
export const generateMockDailyStats = (days = 30) => {
  const stats = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    mockGroups.forEach(group => {
      const betAmount = (Math.random() * 50000 + 10000).toFixed(6); // 10000-60000
      const winRate = 0.45 + Math.random() * 0.1; // 45%-55%赢率
      const payoutTotal = (parseFloat(betAmount) * winRate).toFixed(6);
      const profit = (parseFloat(betAmount) - parseFloat(payoutTotal)).toFixed(6);
      
      stats.push({
        date: dateStr,
        group_id: group.group_id,
        group_name: group.group_name,
        bet_amount: betAmount,
        payout_total: payoutTotal,
        profit: profit,
      });
    });
  }
  
  return stats.sort((a, b) => b.date.localeCompare(a.date));
};

// 生成群赔率配置
export const generateMockOdds = (groupId) => {
  const group = mockGroups.find(g => g.group_id === groupId);
  const items = [];
  
  mockPlayTypes.forEach(play => {
    let odd = '1.9500';
    
    // 根据玩法类型设置不同的赔率
    if (play.code.startsWith('NUM_')) {
      odd = (Math.random() * 5 + 8).toFixed(4); // 8-13
    } else if (['EXTREME_BIG', 'EXTREME_SMALL'].includes(play.code)) {
      odd = (Math.random() * 2 + 10).toFixed(4); // 10-12
    } else if (['PAIR', 'STRAIGHT', 'LEOPARD'].includes(play.code)) {
      odd = (Math.random() * 10 + 15).toFixed(4); // 15-25
    } else if (['BIG_ODD', 'BIG_EVEN', 'SMALL_ODD', 'SMALL_EVEN'].includes(play.code)) {
      odd = (Math.random() * 0.5 + 3.5).toFixed(4); // 3.5-4.0
    }
    
    items.push({
      play_code: play.code,
      play_name: play.name,
      odd: odd,
      status: Math.random() > 0.1 ? 1 : 0, // 90%启用
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_by_name: ['admin', 'ops1', 'manager'][Math.floor(Math.random() * 3)],
    });
  });
  
  return {
    group_id: groupId,
    group_name: group ? group.group_name : '',
    items: items,
  };
};

// Mock元数据
export const mockMeta = {
  groups: mockGroups,
  play_types: mockPlayTypes,
  bet_status: mockBetStatus,
};

