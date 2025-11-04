import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户信息Store
 */
const useUserStore = create(
  persist(
    (set) => ({
      // 用户信息
      userInfo: null,
      token: null,

      // 设置用户信息
      setUser: (user, token) => {
        set({ userInfo: user, token });
        if (token) {
          localStorage.setItem('token', token);
        }
      },

      // 登出
      logout: () => {
        set({ userInfo: null, token: null });
        localStorage.removeItem('token');
        window.location.href = '/login';
      },
    }),
    {
      name: 'user-store',
    }
  )
);

export default useUserStore;

