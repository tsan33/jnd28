# API接口文档

## 基础信息

- **Base URL**: `/user`
- **鉴权方式**: JWT Bearer Token
- **请求格式**: JSON / Query String
- **响应格式**: JSON

## 统一响应格式

```json
{
  "code": 0,           // 状态码，0表示成功
  "msg": "ok",         // 消息
  "data": {...}        // 数据（可选）
}
```

## 错误码表

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

---

## 1. 获取元数据

获取玩法列表、状态字典、用户授权群清单等元数据信息。

**请求**

```
GET /user/meta
```

**响应示例**

```json
{
  "code": 0,
  "data": {
    "groups": [
      {
        "group_id": 20011,
        "group_name": "A群"
      },
      {
        "group_id": 20012,
        "group_name": "B群"
      }
    ],
    "play_types": [
      {"code": "BIG", "name": "大"},
      {"code": "SMALL", "name": "小"},
      {"code": "ODD", "name": "单"},
      {"code": "EVEN", "name": "双"},
      {"code": "BIG_ODD", "name": "大单"},
      {"code": "SMALL_EVEN", "name": "小双"},
      {"code": "EXTREME_BIG", "name": "极大"},
      {"code": "EXTREME_SMALL", "name": "极小"},
      {"code": "PAIR", "name": "对子"},
      {"code": "STRAIGHT", "name": "顺子"},
      {"code": "LEOPARD", "name": "豹子"},
      {"code": "NUM_0", "name": "0"},
      {"code": "NUM_1", "name": "1"},
      {"code": "NUM_27", "name": "27"}
    ],
    "bet_status": {
      "0": "待结算",
      "1": "已中奖",
      "2": "未中奖",
      "3": "撤单"
    }
  }
}
```

---

## 2. 获取投注明细

查询投注明细列表，支持多维度筛选和分页。

**请求**

```
GET /user/bets
```

**Query参数**

| 参数         | 类型   | 必填 | 说明                                    |
|--------------|--------|------|-----------------------------------------|
| group_ids[]  | Array  | 否   | 群组ID列表（多选），缺省=全部授权群     |
| play_codes[] | Array  | 否   | 玩法编码列表（多选）                    |
| status       | Number | 否   | 状态（0/1/2/3）                         |
| issue_no     | String | 否   | 期号（精确匹配）                        |
| time_from    | String | 否   | 开始时间（ISO 8601），默认近7天         |
| time_to      | String | 否   | 结束时间（ISO 8601），默认当前时间      |
| page         | Number | 否   | 页码，从1开始，默认1                    |
| page_size    | Number | 否   | 每页条数，最大100，默认20               |
| order_by     | String | 否   | 排序字段，默认created_at                |
| order_dir    | String | 否   | 排序方向（asc/desc），默认desc          |

**请求示例**

```
GET /user/bets?group_ids[]=20011&group_ids[]=20012&status=1&time_from=2025-11-01T00:00:00Z&time_to=2025-11-05T23:59:59Z&page=1&page_size=20
```

**响应示例**

```json
{
  "code": 0,
  "data": {
    "total": 1234,
    "list": [
      {
        "bet_id": 1001,
        "created_at": "2025-11-05T03:20:00Z",
        "issue_no": "20251105-123",
        "group_id": 20011,
        "group_name": "A群",
        "play_code": "BIG_ODD",
        "play_name": "大单",
        "amount": "100.000000",
        "status": 1,
        "status_label": "已中奖",
        "payout_amount": "295.000000",
        "profit_amount": "195.000000",
        "client_order_no": "m123456"
      }
    ],
    "page": 1,
    "page_size": 20
  }
}
```

**字段说明**

| 字段              | 类型   | 说明                           |
|-------------------|--------|--------------------------------|
| bet_id            | Number | 服务器单号                     |
| created_at        | String | 下单时间（UTC ISO 8601）       |
| issue_no          | String | 期号                           |
| group_id          | Number | 群组ID                         |
| group_name        | String | 群组名称                       |
| play_code         | String | 玩法编码                       |
| play_name         | String | 玩法名称                       |
| amount            | String | 投注额（DECIMAL 18,6）         |
| status            | Number | 状态（0/1/2/3）                |
| status_label      | String | 状态标签                       |
| payout_amount     | String | 派发金额（含本金）             |
| profit_amount     | String | 纯利润（命中才>0）             |
| client_order_no   | String | 客户端单号                     |

---

## 3. 导出投注明细

按当前筛选条件导出投注明细CSV文件。

**请求**

```
GET /user/bets/export
```

**Query参数**

与"获取投注明细"接口相同，但不需要 `page` 和 `page_size` 参数。

**响应**

- Content-Type: `text/csv` 或 `application/octet-stream`
- Content-Disposition: `attachment; filename="bets_export.csv"`

**CSV格式**

```csv
下单时间,期号,群组,玩法,投注额,状态,派发金额,盈利,客户端单号,服务器单号
2025-11-05 11:20:00,20251105-123,A群,大单,100.000000,已中奖,295.000000,195.000000,m123456,1001
```

**限制**

- 最大导出20万行
- 超限返回错误提示改用分片导出

---

## 4. 获取日统计

查询日统计数据，支持按群拆分或合并。

**请求**

```
GET /user/stats/daily
```

**Query参数**

| 参数         | 类型    | 必填 | 说明                                    |
|--------------|---------|------|-----------------------------------------|
| group_ids[]  | Array   | 否   | 群组ID列表（多选），缺省=全部授权群     |
| time_from    | String  | 否   | 开始时间（ISO 8601），默认近7天         |
| time_to      | String  | 否   | 结束时间（ISO 8601），默认当前时间      |
| merge_groups | Boolean | 否   | 是否合并群组（true=仅日期汇总），默认false |

**请求示例**

```
GET /user/stats/daily?group_ids[]=20011&time_from=2025-11-01T00:00:00Z&time_to=2025-11-07T23:59:59Z&merge_groups=false
```

**响应示例（按群拆分）**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "date": "2025-11-01",
        "group_id": 20011,
        "group_name": "A群",
        "bet_amount": "12000.000000",
        "payout_total": "11500.000000",
        "profit": "500.000000"
      },
      {
        "date": "2025-11-01",
        "group_id": 20012,
        "group_name": "B群",
        "bet_amount": "8000.000000",
        "payout_total": "7800.000000",
        "profit": "200.000000"
      }
    ],
    "summary": {
      "bet_amount": "20000.000000",
      "payout_total": "19300.000000",
      "profit": "700.000000"
    }
  }
}
```

**响应示例（合并群组）**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "date": "2025-11-01",
        "bet_amount": "20000.000000",
        "payout_total": "19300.000000",
        "profit": "700.000000"
      }
    ],
    "summary": {
      "bet_amount": "20000.000000",
      "payout_total": "19300.000000",
      "profit": "700.000000"
    }
  }
}
```

**字段说明**

| 字段          | 类型   | 说明                           |
|---------------|--------|--------------------------------|
| date          | String | 日期（YYYY-MM-DD）             |
| group_id      | Number | 群组ID（拆分时有）             |
| group_name    | String | 群组名称（拆分时有）           |
| bet_amount    | String | 投注总额                       |
| payout_total  | String | 派发总额                       |
| profit        | String | 盈亏（投注额-派发额）          |

---

## 5. 获取群赔率配置

获取指定群组的赔率配置。

**请求**

```
GET /user/odds
```

**Query参数**

| 参数     | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| group_id | Number | 是   | 群组ID |

**请求示例**

```
GET /user/odds?group_id=20011
```

**响应示例**

```json
{
  "code": 0,
  "data": {
    "group_id": 20011,
    "group_name": "A群",
    "items": [
      {
        "play_code": "BIG",
        "play_name": "大",
        "odd": "1.9500",
        "status": 1,
        "updated_at": "2025-11-05T03:00:00Z",
        "updated_by_name": "admin"
      },
      {
        "play_code": "SMALL",
        "play_name": "小",
        "odd": "1.9500",
        "status": 1,
        "updated_at": "2025-11-05T03:00:00Z",
        "updated_by_name": "admin"
      },
      {
        "play_code": "NUM_0",
        "play_name": "0",
        "odd": "9.5000",
        "status": 1,
        "updated_at": "2025-11-01T10:00:00Z",
        "updated_by_name": "ops1"
      }
    ]
  }
}
```

**字段说明**

| 字段            | 类型   | 说明                           |
|-----------------|--------|--------------------------------|
| play_code       | String | 玩法编码                       |
| play_name       | String | 玩法名称                       |
| odd             | String | 赔率（DECIMAL 10,4）           |
| status          | Number | 状态（0=禁用，1=启用）         |
| updated_at      | String | 最后更新时间（UTC ISO 8601）   |
| updated_by_name | String | 更新人                         |

---

## 6. 保存群赔率配置

保存指定群组的赔率配置（批量）。

**请求**

```
POST /user/odds/set
Content-Type: application/json
```

**Body参数**

```json
{
  "group_id": 20011,
  "items": [
    {
      "play_code": "BIG",
      "odd": "1.9700",
      "status": 1
    },
    {
      "play_code": "SMALL",
      "odd": "1.9300",
      "status": 1
    }
  ]
}
```

**字段说明**

| 字段      | 类型   | 必填 | 说明                           |
|-----------|--------|------|--------------------------------|
| group_id  | Number | 是   | 群组ID                         |
| items     | Array  | 是   | 赔率配置项列表                 |
| play_code | String | 是   | 玩法编码                       |
| odd       | String | 否   | 赔率（1.0100-100.0000）        |
| status    | Number | 否   | 状态（0/1）                    |

**响应示例**

```json
{
  "code": 0,
  "msg": "saved",
  "data": {
    "updated": 2
  }
}
```

**校验规则**

- 校验 `group_id` 对当前用户授权
- 玩法枚举合法性校验
- 赔率范围校验（1.0100 - 100.0000）
- 赔率精度校验（最多4位小数）
- 记录审计日志（操作人、时间、IP、变更前后值）

---

## 审计与安全

### 操作审计

所有赔率修改操作都会记录审计日志：

- `actor_user_id`: 操作人ID
- `action`: 操作类型（如 `set_odds`）
- `payload`: 操作详情（JSON，包含变更前后值）
- `created_at`: 操作时间
- `ip`: 操作IP

### 限流策略

- **用户维度**: 30 req/min
- **导出操作**: 单独限流（如 5 req/hour）
- **超限响应**: 错误码 42900

### 权限控制

- 所有接口均需有效的 JWT Token
- 涉及群组的查询强制校验 `user_group_perms`
- 未授权群组返回错误码 40301

---

## 附录

### 玩法编码表

| 编码           | 名称   | 说明           |
|----------------|--------|----------------|
| BIG            | 大     | 和值 ≥ 14      |
| SMALL          | 小     | 和值 < 14      |
| ODD            | 单     | 和值为奇数     |
| EVEN           | 双     | 和值为偶数     |
| BIG_ODD        | 大单   | 大且单         |
| SMALL_EVEN     | 小双   | 小且双         |
| EXTREME_BIG    | 极大   | 和值 ≥ 23      |
| EXTREME_SMALL  | 极小   | 和值 ≤ 5       |
| PAIR           | 对子   | 任意两位相同   |
| STRAIGHT       | 顺子   | 连续三位数     |
| LEOPARD        | 豹子   | 三位相同       |
| NUM_0 ~ NUM_27 | 0 ~ 27 | 精确和值投注   |

### 时间格式

所有时间字段使用 ISO 8601 格式（UTC）：

```
2025-11-05T03:20:00Z
```

前端显示时转换为伊斯坦布尔时区：

```
2025-11-05 06:20:00 (Istanbul)
```

### 金额与赔率精度

- **金额**: DECIMAL(18,6)，前端显示2位小数，导出6位
- **赔率**: DECIMAL(10,4)，固定显示4位小数

### 分页限制

- `page_size` 最大值：100
- 超过限制返回错误码 42204

### 时间范围限制

- 查询最大跨度：90天
- 超过限制返回错误码 42203

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-05

