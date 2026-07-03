# cc-sync — Cloudflare Worker + D1 后端

免费、不休眠的云端存储 + 同步 API，给 CC 训练记录用。数据量极小（十年也就 ~1–2 MB），远在免费额度内。

## 本地验证（不用联网）

```
cd worker
node test/local-test.mjs
```

## 部署（都在你自己电脑上跑，需要你的 Cloudflare 登录）

1. 注册免费 Cloudflare 账号：https://dash.cloudflare.com （不用信用卡）。
2. 安装 wrangler：`npm install -g wrangler`
3. 登录（会打开浏览器）：`wrangler login`
4. 创建 D1 数据库：`wrangler d1 create cc-db`
   把打印出来的 `database_id` 填进 `wrangler.toml` 的 `database_id`。
5. 建表（远端库）：`wrangler d1 execute cc-db --remote --file=schema.sql`
6. 设置两个密钥：
   - `wrangler secret put APP_KEY` —— 客户端写入用（会进前端，随便一串即可，仅挡机器人）
   - `wrangler secret put ADMIN_KEY` —— 后台用（**私密**，别泄露，能看所有人）
7. 部署：`wrangler deploy`
   记下地址：`https://cc-sync.<你的子域>.workers.dev`
8. 自测：浏览器打开 `https://cc-sync.<...>.workers.dev/api/health`
   看到 `{"ok":true,...}` 就成了。

部署好后，把 **Worker 地址** 和 **APP_KEY** 告诉我（APP_KEY 反正会进公开前端），
我来接前端同步（Phase B）和后台统计页（Phase C）。

## API

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET  | `/api/health` | 无 | 健康检查 |
| GET  | `/api/pull?user=U&since=T` | `X-App-Key` | 拉取 U 在 T 之后更新的记录（含墓碑） |
| POST | `/api/push` | `X-App-Key` | 上推 `{user, records:[...]}`，按 updated_at 做 LWW |
| GET  | `/api/admin/pull?since=T` | `X-Admin-Key` | 拉取所有人（带 user 字段） |
| GET  | `/api/admin/users` | `X-Admin-Key` | 用户列表 + 记录数 |
