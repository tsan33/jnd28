# 加拿大28投注 - 用户后台系统

这是一个基于 React + Ant Design + Vite 构建的加拿大28投注用户后台管理系统。

## 功能特性

### 1. 投注明细页
- ✅ 多维度筛选（群组、玩法、状态、时间范围、期号）
- ✅ 分页浏览（支持20/50/100条/页）
- ✅ 数据导出（CSV格式）
- ✅ 时间本地化显示（伊斯坦布尔时区 + UTC tooltip）
- ✅ 金额、赔率精确显示
- ✅ 空状态提示

### 2. 日统计页
- ✅ 汇总数据（总投注额、总派发额、总盈亏）
- ✅ 可视化图表（投注趋势、盈亏趋势）
- ✅ 按群组拆分/合并统计
- ✅ 时间范围筛选（默认近7天，最大90天）
- ✅ 数据导出

### 3. 群与赔率管理页
- ✅ 左侧群组列表（支持搜索）
- ✅ 右侧赔率配置表格
- ✅ 实时编辑赔率（保留4位小数）
- ✅ 启用/禁用玩法状态
- ✅ 批量保存变更
- ✅ 未保存变更提醒
- ✅ 赔率范围校验（1.0100 - 100.0000）
- ✅ 操作审计记录

### 4. 通用功能
- ✅ 用户登录鉴权
- ✅ 权限控制（仅显示授权群组）
- ✅ 响应式设计
- ✅ 错误处理和提示
- ✅ 请求限流处理

## 技术栈

- **框架**: React 18
- **UI组件库**: Ant Design 5
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **图表**: Recharts
- **日期处理**: Day.js
- **Hooks工具**: ahooks
- **构建工具**: Vite

## 项目结构

```
加拿大28投注/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout/          # 布局组件
│   │   ├── TimeTooltip/     # 时间显示组件
│   │   └── ExportButton/    # 导出按钮组件
│   ├── pages/               # 页面组件
│   │   ├── Login/           # 登录页
│   │   ├── Dashboard/       # 概览页
│   │   ├── BetDetails/      # 投注明细页
│   │   ├── DailyStats/      # 日统计页
│   │   └── GroupOdds/       # 群与赔率页
│   ├── services/            # API服务
│   │   └── api.js           # API接口定义
│   ├── store/               # 状态管理
│   │   ├── useMetaStore.js  # 元数据Store
│   │   └── useUserStore.js  # 用户Store
│   ├── utils/               # 工具函数
│   │   ├── request.js       # HTTP请求封装
│   │   └── format.js        # 格式化工具
│   ├── App.jsx              # 根组件
│   ├── main.jsx             # 入口文件
│   └── index.css            # 全局样式
├── package.json             # 项目配置
├── vite.config.js           # Vite配置
├── index.html               # HTML模板
└── README.md                # 项目文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

## 环境配置

### API代理配置

开发环境下，API请求会被代理到 `http://localhost:8080`。

可在 `vite.config.js` 中修改代理配置：

```javascript
server: {
  proxy: {
    '/user': {
      target: 'http://your-api-server:port',
      changeOrigin: true,
    },
  },
}
```

### 时区配置

默认时区为伊斯坦布尔（Europe/Istanbul），可在 `src/utils/format.js` 中修改：

```javascript
export const DEFAULT_TIMEZONE = 'Europe/Istanbul';
```

## API接口规范

### 基础约定

- **鉴权方式**: JWT Token（通过 Authorization Header 传递）
- **请求格式**: JSON
- **响应格式**: 统一格式 `{code, msg, data}`
- **成功状态码**: 0
- **时间格式**: ISO 8601（UTC）

### 主要接口

#### 1. 获取元数据
```
GET /user/meta
```

#### 2. 获取投注明细
```
GET /user/bets?group_ids[]=...&play_codes[]=...&status=...&time_from=...&time_to=...&page=1&page_size=20
```

#### 3. 导出投注明细
```
GET /user/bets/export
```

#### 4. 获取日统计
```
GET /user/stats/daily?group_ids[]=...&time_from=...&time_to=...&merge_groups=false
```

#### 5. 获取群赔率配置
```
GET /user/odds?group_id=20011
```

#### 6. 保存群赔率配置
```
POST /user/odds/set
Body: {group_id, items: [{play_code, odd, status}]}
```

### 错误码说明

| Code  | 说明                         |
|-------|------------------------------|
| 0     | 成功                         |
| 40100 | 未登录或token失效            |
| 40301 | 无群组权限                   |
| 42201 | 无效的玩法编码               |
| 42202 | 赔率超出范围                 |
| 42203 | 时间范围无效（最大90天）     |
| 42204 | 分页参数过大                 |
| 42900 | 请求过于频繁                 |
| 50000 | 服务器内部错误               |

## 数据字段说明

### 投注明细字段

- `bet_id`: 服务器单号
- `client_order_no`: 客户端单号
- `created_at`: 下单时间（UTC）
- `issue_no`: 期号
- `group_id` / `group_name`: 群ID/群名
- `play_code` / `play_name`: 玩法编码/名称
- `amount`: 投注额（DECIMAL 18,6）
- `status`: 状态（0=待结算, 1=已中奖, 2=未中奖, 3=撤单）
- `payout_amount`: 派发金额（含本金）
- `profit_amount`: 纯利润（命中时 = 投注额×赔率，未中=0）

### 赔率配置字段

- `play_code`: 玩法编码
- `play_name`: 玩法名称
- `odd`: 赔率（DECIMAL 10,4，范围 1.0100 - 100.0000）
- `status`: 状态（0=禁用, 1=启用）
- `updated_at`: 最后更新时间
- `updated_by_name`: 更新人

## 用户操作指南

### 登录

1. 访问登录页面
2. 输入用户名和密码
3. 点击"登录"按钮

> 注：当前为演示版本，任意用户名密码均可登录

### 查看投注明细

1. 点击左侧菜单"投注明细"
2. 选择筛选条件（群组、玩法、状态、时间范围等）
3. 点击"查询"按钮
4. 可点击"导出CSV"导出当前筛选结果

### 查看日统计

1. 点击左侧菜单"日统计"
2. 选择群组和时间范围
3. 切换"合并群组"开关可按群拆分/合并统计
4. 查看汇总数据和趋势图表
5. 可导出统计数据

### 管理群赔率

1. 点击左侧菜单"群与赔率"
2. 从左侧列表选择要配置的群组
3. 在右侧表格中编辑赔率（支持修改赔率值和启用/禁用状态）
4. 点击"保存全部变更"提交修改
5. 切换群组前会提示保存未保存的变更

## 安全与权限

### 权限控制

- 用户仅能查看和操作已授权的群组
- 后端严格校验 `user_group_perms`
- 所有接口均需要有效的登录token

### 操作审计

- 赔率修改会记录操作人、时间、IP和变更内容
- 审计日志存储在 `audit_logs` 表

### 限流保护

- 用户维度 QPS 限制（默认 30 req/min）
- 导出操作单独限流
- 超限返回错误码 42900

## 开发注意事项

### 1. 时间处理

- 所有时间字段统一使用 ISO 8601 格式（UTC）
- 前端显示时自动转换为伊斯坦布尔时区
- 鼠标悬浮显示 UTC 原始时间

### 2. 金额精度

- 投注额、派发额使用 DECIMAL(18,6)
- 前端显示保留2位小数
- 导出CSV保留6位小数

### 3. 赔率精度

- 赔率使用 DECIMAL(10,4)
- 输入和显示均保留4位小数
- 范围限制：1.0100 - 100.0000

### 4. 数据校验

- 前端进行基础校验（格式、范围等）
- 后端进行完整校验和权限检查
- 双重保障数据安全

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

最低版本要求：支持 ES6+ 的现代浏览器

## 常见问题

### Q1: 登录后提示"未登录或token失效"？

**A**: 检查后端API是否正常运行，确认token正确存储在localStorage中。

### Q2: 导出CSV失败？

**A**: 检查筛选条件，确保数据量不超过20万行限制。

### Q3: 赔率保存失败？

**A**: 确认赔率值在有效范围内（1.0100 - 100.0000），且具有该群组的操作权限。

### Q4: 时间显示不正确？

**A**: 检查时区配置是否正确，默认为伊斯坦布尔时区。

## 后续优化计划

- [ ] 添加实时数据推送（WebSocket）
- [ ] 支持更多导出格式（Excel、PDF）
- [ ] 添加数据可视化大屏
- [ ] 支持多语言切换（中文/英文）
- [ ] 移动端适配
- [ ] 离线缓存支持

## 技术支持

如有问题或建议，请联系技术团队。

---

**版本**: 1.0.0  
**最后更新**: 2025-11-05

