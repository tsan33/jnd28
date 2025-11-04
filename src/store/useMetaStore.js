import { create } from 'zustand';
import { getMeta } from '@/services/api';

/**
 * 元数据Store（玩法、群组、状态字典等）
 */
const useMetaStore = create((set, get) => ({
  // 数据
  groups: [],
  playTypes: [],
  betStatus: {},
  loading: false,
  loaded: false,

  // 初始化元数据
  fetchMeta: async () => {
    if (get().loaded) return;
    
    set({ loading: true });
    try {
      const data = await getMeta();
      set({
        groups: data.groups || [],
        playTypes: data.play_types || [],
        betStatus: data.bet_status || {},
        loaded: true,
      });
    } catch (error) {
      console.error('Failed to fetch meta:', error);
    } finally {
      set({ loading: false });
    }
  },

  // 根据code获取玩法名称
  getPlayName: (code) => {
    const playTypes = get().playTypes;
    const play = playTypes.find((p) => p.code === code);
    return play?.name || code;
  },

  // 根据group_id获取群名称
  getGroupName: (groupId) => {
    const groups = get().groups;
    const group = groups.find((g) => g.group_id === groupId);
    return group?.group_name || groupId;
  },

  // 获取投注状态标签
  getBetStatusLabel: (status) => {
    const betStatus = get().betStatus;
    return betStatus[status] || status;
  },
}));

export default useMetaStore;

