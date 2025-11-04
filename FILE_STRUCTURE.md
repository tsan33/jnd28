# 项目文件结构

```
加拿大28投注/
│
├── 📄 配置文件
│   ├── package.json              # 项目配置和依赖
│   ├── vite.config.js            # Vite构建配置
│   ├── .eslintrc.cjs             # ESLint配置
│   ├── .gitignore                # Git忽略配置
│   └── index.html                # HTML入口模板
│
├── 📚 文档文件
│   ├── README.md                 # 项目主文档
│   ├── API.md                    # API接口文档
│   ├── DEPLOYMENT.md             # 部署指南
│   ├── QUICKSTART.md             # 快速启动指南
│   ├── PROJECT_SUMMARY.md        # 项目总结
│   └── FILE_STRUCTURE.md         # 文件结构（本文件）
│
└── 📁 src/                       # 源代码目录
    │
    ├── 🎯 入口文件
    │   ├── main.jsx              # 应用入口
    │   ├── App.jsx               # 根组件
    │   └── index.css             # 全局样式
    │
    ├── 🧩 components/            # 公共组件
    │   │
    │   ├── Layout/               # 布局组件
    │   │   ├── MainLayout.jsx    # 主布局组件
    │   │   └── MainLayout.css    # 布局样式
    │   │
    │   ├── TimeTooltip/          # 时间显示组件
    │   │   └── index.jsx         # 时间+UTC tooltip
    │   │
    │   └── ExportButton/         # 导出按钮组件
    │       └── index.jsx         # CSV导出功能
    │
    ├── 📄 pages/                 # 页面组件
    │   │
    │   ├── Login/                # 登录页
    │   │   ├── index.jsx         # 登录表单
    │   │   └── index.css         # 登录样式
    │   │
    │   ├── Dashboard/            # 概览页
    │   │   ├── index.jsx         # 仪表盘
    │   │   └── index.css         # 仪表盘样式
    │   │
    │   ├── BetDetails/           # 投注明细页
    │   │   ├── index.jsx         # 明细列表+筛选
    │   │   └── index.css         # 明细样式
    │   │
    │   ├── DailyStats/           # 日统计页
    │   │   ├── index.jsx         # 统计图表+表格
    │   │   └── index.css         # 统计样式
    │   │
    │   └── GroupOdds/            # 群与赔率页
    │       ├── index.jsx         # 赔率配置表格
    │       └── index.css         # 赔率样式
    │
    ├── 🔌 services/              # API服务层
    │   └── api.js                # API接口定义
    │
    ├── 📦 store/                 # 状态管理
    │   ├── useMetaStore.js       # 元数据Store（玩法、群组等）
    │   └── useUserStore.js       # 用户Store（登录状态）
    │
    └── 🛠 utils/                 # 工具函数
        ├── request.js            # HTTP请求封装（Axios）
        └── format.js             # 格式化工具（时间、金额、赔率）
```

---

## 文件说明

### 📄 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目元信息、依赖包、脚本命令 |
| `vite.config.js` | Vite构建工具配置（别名、代理、插件） |
| `.eslintrc.cjs` | ESLint代码检查规则 |
| `.gitignore` | Git版本控制忽略规则 |
| `index.html` | HTML模板文件 |

### 📚 文档文件

| 文件 | 说明 |
|------|------|
| `README.md` | 项目主文档（功能、技术栈、使用指南） |
| `API.md` | 后端API接口完整文档 |
| `DEPLOYMENT.md` | 部署指南（开发/生产/Docker） |
| `QUICKSTART.md` | 5分钟快速启动指南 |
| `PROJECT_SUMMARY.md` | 项目总结（架构、清单、亮点） |
| `FILE_STRUCTURE.md` | 文件结构说明（本文件） |

### 🎯 入口文件

| 文件 | 说明 |
|------|------|
| `src/main.jsx` | React应用入口，挂载根组件 |
| `src/App.jsx` | 根组件，包含路由配置 |
| `src/index.css` | 全局样式（重置、滚动条等） |

### 🧩 公共组件

| 组件 | 功能 |
|------|------|
| `Layout/MainLayout` | 主布局（顶栏+侧边栏+内容区） |
| `TimeTooltip` | 时间显示（本地化+UTC tooltip） |
| `ExportButton` | 导出按钮（CSV导出逻辑） |

### 📄 页面组件

| 页面 | 路由 | 功能 |
|------|------|------|
| `Login` | `/login` | 用户登录 |
| `Dashboard` | `/dashboard` | 概览仪表盘 |
| `BetDetails` | `/bets` | 投注明细查询 |
| `DailyStats` | `/stats` | 日统计分析 |
| `GroupOdds` | `/odds` | 群赔率管理 |

### 🔌 API服务

| 文件 | 功能 |
|------|------|
| `services/api.js` | 封装所有后端API接口调用 |

### 📦 状态管理

| Store | 功能 |
|-------|------|
| `useMetaStore` | 管理元数据（玩法、群组、状态字典） |
| `useUserStore` | 管理用户信息和登录状态 |

### 🛠 工具函数

| 文件 | 功能 |
|------|------|
| `utils/request.js` | Axios封装（拦截器、错误处理） |
| `utils/format.js` | 格式化函数（时间、金额、赔率、校验） |

---

## 核心依赖

### 生产依赖
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "antd": "^5.12.0",
  "axios": "^1.6.2",
  "dayjs": "^1.11.10",
  "recharts": "^2.10.3",
  "ahooks": "^3.7.8",
  "zustand": "^4.4.7"
}
```

### 开发依赖
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8",
  "eslint": "^8.55.0"
}
```

---

## 代码统计

### 组件数量
- 📄 页面组件: 5个
- 🧩 公共组件: 3个
- 📦 Store: 2个
- 🛠 工具模块: 2个

### 代码行数（估算）
- 总代码: ~2500行
- JSX组件: ~2000行
- 工具函数: ~300行
- 样式代码: ~200行

---

## 路由结构

```
/
├── /login                  # 登录页（公开）
└── /                       # 主布局（需登录）
    ├── /dashboard          # 概览
    ├── /bets               # 投注明细
    ├── /stats              # 日统计
    └── /odds               # 群与赔率
```

---

## 状态管理结构

```
Store
├── useMetaStore            # 元数据
│   ├── groups[]            # 授权群组列表
│   ├── playTypes[]         # 玩法枚举
│   ├── betStatus{}         # 状态字典
│   └── methods             # 获取方法
│
└── useUserStore            # 用户状态
    ├── userInfo            # 用户信息
    ├── token               # JWT Token
    └── methods             # 登录/登出
```

---

## API接口结构

```
/user
├── GET  /meta              # 获取元数据
├── GET  /bets              # 查询投注明细
├── GET  /bets/export       # 导出投注明细
├── GET  /stats/daily       # 获取日统计
├── GET  /odds              # 获取群赔率
└── POST /odds/set          # 保存群赔率
```

详细接口文档请查看 [API.md](./API.md)

---

## 构建产物结构

```
dist/
├── index.html              # 入口HTML
├── assets/                 # 静态资源
│   ├── index-[hash].js     # 主JS包
│   ├── index-[hash].css    # 主CSS包
│   └── vendor-[hash].js    # 第三方库包
└── vite.svg                # 图标
```

---

## 开发工作流

```
1. 编辑代码
   ↓
2. Vite热更新
   ↓
3. ESLint检查
   ↓
4. 浏览器预览
   ↓
5. 构建打包
   ↓
6. 部署上线
```

---

## 快速定位文件

### 需要修改API地址？
👉 `vite.config.js` - 修改proxy配置

### 需要添加新接口？
👉 `src/services/api.js` - 添加API函数

### 需要修改布局？
👉 `src/components/Layout/MainLayout.jsx`

### 需要添加新页面？
👉 `src/pages/` - 创建新文件夹
👉 `src/App.jsx` - 添加路由

### 需要修改样式？
👉 各组件对应的 `.css` 文件

### 需要添加工具函数？
👉 `src/utils/format.js` 或 `src/utils/request.js`

---

**提示**: 所有组件都有详细的注释说明，阅读代码时可快速理解功能。

**版本**: 1.0.0  
**最后更新**: 2025-11-05

