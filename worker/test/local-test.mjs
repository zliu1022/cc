// 本地验证 Worker 逻辑：用 node:sqlite 模拟 D1，无需联网/wrangler。
// 运行：node test/local-test.mjs  （Node 22+ 自带 node:sqlite）
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../src/index.js';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));

// D1 兼容 shim（prepare/bind/all/first/run）
const env = {
	APP_KEY: 'testapp',
	ADMIN_KEY: 'testadmin',
	DB: {
		prepare(sql) {
			return {
				_p: [],
				bind(...a) { this._p = a; return this; },
				async all() { return { results: sqlite.prepare(sql).all(...this._p) }; },
				async first() { return sqlite.prepare(sql).get(...this._p) ?? null; },
				async run() { return { success: true, meta: sqlite.prepare(sql).run(...this._p) }; },
			};
		},
	},
};

function req(method, path, { body, appKey, adminKey } = {}) {
	const headers = {};
	if (appKey) headers['X-App-Key'] = appKey;
	if (adminKey) headers['X-Admin-Key'] = adminKey;
	if (body) headers['Content-Type'] = 'application/json';
	return new Request('https://x' + path, {
		method, headers, body: body ? JSON.stringify(body) : undefined,
	});
}
const call = async (...a) => { const r = await handleRequest(req(...a), env); return { status: r.status, body: await r.json() }; };

let pass = 0, fail = 0;
function ok(name, cond) { cond ? (pass++, console.log('  ✓ ' + name)) : (fail++, console.log('  ✗ ' + name)); }

const A = 'PUSHUP';
const rec = (extra) => ({ Table: A, Year: 2026, Month: 7, Day: 4, Level: 5, N1: 20, N2: 15, N3: 10, Comment: 'hi', ...extra });

console.log('cc-sync worker tests');

// health
ok('health ok', (await call('GET', '/api/health')).body.ok === true);

// auth gate
ok('pull without app key -> 401', (await call('GET', '/api/pull?user=alice')).status === 401);

// push + pull
await call('POST', '/api/push', { appKey: 'testapp', body: { user: 'alice', records: [rec({ updated_at: 100 })] } });
let p = await call('GET', '/api/pull?user=alice&since=0', { appKey: 'testapp' });
ok('pull returns the pushed record', p.body.records.length === 1 && p.body.records[0].N1 === 20);

// LWW: older update must NOT overwrite
await call('POST', '/api/push', { appKey: 'testapp', body: { user: 'alice', records: [rec({ updated_at: 50, N1: 999 })] } });
p = await call('GET', '/api/pull?user=alice&since=0', { appKey: 'testapp' });
ok('older update ignored (LWW)', p.body.records[0].N1 === 20);

// LWW: newer update wins
await call('POST', '/api/push', { appKey: 'testapp', body: { user: 'alice', records: [rec({ updated_at: 200, N1: 42 })] } });
p = await call('GET', '/api/pull?user=alice&since=0', { appKey: 'testapp' });
ok('newer update applied (LWW)', p.body.records[0].N1 === 42);

// incremental pull (since)
p = await call('GET', '/api/pull?user=alice&since=150', { appKey: 'testapp' });
ok('incremental pull respects since', p.body.records.length === 1 && p.body.records[0].updated_at === 200);
p = await call('GET', '/api/pull?user=alice&since=200', { appKey: 'testapp' });
ok('nothing newer than 200', p.body.records.length === 0);

// tombstone delete syncs out
await call('POST', '/api/push', { appKey: 'testapp', body: { user: 'alice', records: [rec({ updated_at: 300, deleted: true })] } });
p = await call('GET', '/api/pull?user=alice&since=0', { appKey: 'testapp' });
ok('delete is a synced tombstone', p.body.records.length === 1 && p.body.records[0].deleted === 1);

// partition isolation
await call('POST', '/api/push', { appKey: 'testapp', body: { user: 'bob', records: [rec({ updated_at: 100, N1: 7 })] } });
p = await call('GET', '/api/pull?user=alice&since=0', { appKey: 'testapp' });
ok("alice can't see bob's data", p.body.records.every(r => r.N1 !== 7));

// admin
ok('admin pull needs admin key', (await call('GET', '/api/admin/pull')).status === 401);
const ap = await call('GET', '/api/admin/pull?since=0', { adminKey: 'testadmin' });
ok('admin sees all users with user field', ap.body.records.some(r => r.user === 'alice') && ap.body.records.some(r => r.user === 'bob'));
const au = await call('GET', '/api/admin/users', { adminKey: 'testadmin' });
ok('admin/users lists bob (alice tombstoned)', au.body.users.some(u => u.usr === 'bob'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
