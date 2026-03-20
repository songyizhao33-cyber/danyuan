# 旦缘 - 数据库结构设计

## 1. 集合设计

### 1.1 users 集合

| 字段名 | 数据类型 | 描述 | 索引 | 约束 |
|-------|---------|------|------|------|
| `_id` | ObjectId | 用户ID | 主键 | 唯一 |
| `email` | String | 邮箱地址 | 唯一索引 | 必须，后缀为edu.cn |
| `password` | String | 密码哈希 | - | 可选，首次登录后设置 |
| `verifyCode` | String | 验证码 | - | 临时字段 |
| `verifyCodeExpire` | Date | 验证码过期时间 | - | 临时字段 |
| `isVerified` | Boolean | 邮箱是否验证 | - | 默认false |
| `questionnaireCompleted` | Boolean | 问卷是否完成 | - | 默认false |
| `createdAt` | Date | 注册时间 | - | 自动生成 |
| `lastLoginAt` | Date | 上次登录时间 | - | 自动更新 |
| `role` | String | 用户角色 | - | 默认'user' |

### 1.2 questionnaires 集合

| 字段名 | 数据类型 | 描述 | 索引 | 约束 |
|-------|---------|------|------|------|
| `_id` | ObjectId | 问卷ID | 主键 | 唯一 |
| `userId` | ObjectId | 用户ID | 唯一索引 | 关联users集合 |
| `basicInfo` | Object | 基础信息 | - | 包含以下子字段： |
| | `gender` | String | - | 性别 |
| | `preferredGender` | String | - | 希望匹配性别 |
| | `purpose` | String | - | 来本平台目的 |
| | `age` | Number | - | 年龄 |
| | `campus` | String | - | 校区 |
| | `hometown` | String | - | 家乡 |
| | `education` | String | - | 教育程度 |
| `familyAttitude` | Object | 家庭婚育态度 | - | 包含以下子字段： |
| | `marriageIntention` | Number | - | 对恋爱直达婚姻的意愿强度(1-7) |
| | `familyLifeView` | String | - | 家庭生活观 |
| | `childrenAttitude` | Number | - | 对生育的态度(1-7) |
| `lifestyle` | Object | 日常生活习惯和观念 | - | 包含以下子字段： |
| | `consumptionStyle` | Number | - | 消费风格(1-7) |
| | `drinking` | Boolean | - | 是否饮酒 |
| | `freeTimeActivities` | Array | - | 如何度过空余时间 |
| | `sleepSchedule` | String | - | 作息时间 |
| `interests` | Object | 兴趣爱好 | - | 包含以下子字段： |
| | `hobbies` | Array | - | 兴趣爱好列表 |
| | `sports` | Array | - | 运动爱好 |
| | `music` | Array | - | 音乐偏好 |
| | `movies` | Array | - | 电影偏好 |
| `personality` | Object | 人格测试 | - | 包含以下子字段： |
| | `relationshipAttitude` | Object | - | 对亲密关系问题的测评 |
| | `socialHabits` | Number | - | 个人社交习惯(1-7) |
| | `jungianType` | String | - | 荣格八维测试结果 |
| `progress` | Number | - | 问卷填写进度(0-100) |
| `isCompleted` | Boolean | - | 问卷是否完成 |
| `updatedAt` | Date | - | 上次更新时间 |
| `completedAt` | Date | - | 完成时间 |

### 1.3 matches 集合

| 字段名 | 数据类型 | 描述 | 索引 | 约束 |
|-------|---------|------|------|------|
| `_id` | ObjectId | 匹配ID | 主键 | 唯一 |
| `userId1` | ObjectId | 用户1 ID | 复合索引 | 关联users集合 |
| `userId2` | ObjectId | 用户2 ID | 复合索引 | 关联users集合 |
| `matchScore` | Number | 匹配分数 | - | 0-100 |
| `matchDate` | Date | 匹配时间 | - | 自动生成 |
| `isNotified1` | Boolean | 用户1是否已通知 | - | 默认false |
| `isNotified2` | Boolean | 用户2是否已通知 | - | 默认false |
| `matchRound` | Number | 匹配轮次 | - | 用于区分不同批次的匹配 |

### 1.4 admin 集合

| 字段名 | 数据类型 | 描述 | 索引 | 约束 |
|-------|---------|------|------|------|
| `_id` | ObjectId | 管理员ID | 主键 | 唯一 |
| `username` | String | 管理员账号 | 唯一索引 | 必须 |
| `password` | String | 密码哈希 | - | 必须 |
| `role` | String | 管理员角色 | - | 默认'admin' |
| `createdAt` | Date | 创建时间 | - | 自动生成 |
| `lastLoginAt` | Date | 上次登录时间 | - | 自动更新 |

## 2. 索引设计

### 2.1 users 集合索引
- `email`：唯一索引，加速邮箱查询
- `questionnaireCompleted`：普通索引，用于筛选已完成问卷的用户

### 2.2 questionnaires 集合索引
- `userId`：唯一索引，确保每个用户只有一份问卷
- `isCompleted`：普通索引，用于筛选已完成问卷的用户

### 2.3 matches 集合索引
- `userId1` + `userId2`：复合索引，加速匹配查询
- `matchRound`：普通索引，用于按轮次查询匹配结果

## 3. 数据关系

### 3.1 用户与问卷关系
- 一对一关系：每个用户对应一份问卷
- 通过 `userId` 字段关联

### 3.2 用户与匹配关系
- 多对多关系：一个用户可以与多个用户匹配
- 通过 `userId1` 和 `userId2` 字段关联

### 3.3 管理员与系统关系
- 管理员可以查看所有用户数据和匹配结果
- 管理员可以管理系统设置和监控系统运行状态

## 4. 数据安全

### 4.1 密码安全
- 密码使用 bcrypt 进行哈希存储
- 禁止明文存储密码

### 4.2 验证码安全
- 验证码设置过期时间（如15分钟）
- 验证码使用随机生成的字符串

### 4.3 数据访问控制
- 普通用户只能访问自己的数据
- 管理员可以访问所有数据
- 使用 JWT 进行身份验证和授权

## 5. 数据备份与恢复

### 5.1 备份策略
- 使用 MongoDB Atlas 的自动备份功能
- 定期（如每周）进行全量备份
- 保留最近30天的备份

### 5.2 恢复策略
- 当数据丢失时，从最近的备份中恢复
- 测试恢复流程，确保备份可用

## 6. 性能考虑

### 6.1 查询优化
- 为常用查询字段创建索引
- 避免全表扫描
- 使用投影减少返回数据量

### 6.2 写入优化
- 使用批量操作减少写入次数
- 合理设置写关注级别

### 6.3 存储优化
- 对大型数组字段使用适当的存储策略
- 定期清理过期数据（如过期的验证码）

## 7. 扩展考虑

### 7.1 未来字段扩展
- 预留字段用于未来功能扩展
- 使用嵌套文档结构，便于添加新字段

### 7.2 分片策略
- 当数据量增长到一定程度时，考虑使用 MongoDB 分片
- 按用户ID进行分片，提高查询性能