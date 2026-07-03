-- CC 训练记录表（D1 / SQLite）
-- 主键与前端本地库一致：同一 (用户, 锻炼, 年, 月, 日, 级别) 只有一条。
-- updated_at 用于 last-write-wins 同步；deleted=1 是墓碑（删除也能同步出去）。
CREATE TABLE IF NOT EXISTS records (
  usr        TEXT    NOT NULL,          -- Prison No.（数据分区）
  tbl        TEXT    NOT NULL,          -- 锻炼名 PUSHUP/BRIDGE/...
  yr         INTEGER NOT NULL,
  mo         INTEGER NOT NULL,
  dy         INTEGER NOT NULL,
  lvl        INTEGER NOT NULL,
  n1         INTEGER NOT NULL DEFAULT 0,
  n2         INTEGER NOT NULL DEFAULT 0,
  n3         INTEGER NOT NULL DEFAULT 0,
  comment    TEXT    NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL,          -- 毫秒时间戳
  deleted    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (usr, tbl, yr, mo, dy, lvl)
);

CREATE INDEX IF NOT EXISTS idx_user_updated ON records (usr, updated_at);
