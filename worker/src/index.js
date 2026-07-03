// Cloudflare Worker：CC 云同步 API（D1 支撑）
//
// 同步模型：本地优先。客户端把本地改动 push 上来，再 pull 服务端更新的记录，
// 按 updated_at 做 last-write-wins。删除用墓碑（deleted=1）表示，保证能同步。
//
// 鉴权：
//   用户端 (/api/pull, /api/push)   需要 X-App-Key == APP_KEY
//     —— APP_KEY 会出现在公开的前端里，只能挡机器人，不是强安全。
//   后台   (/api/admin/*)          需要 X-Admin-Key == ADMIN_KEY
//     —— ADMIN_KEY 不进前端，私密保存，能看到所有人的数据。

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, X-App-Key, X-Admin-Key',
	'Access-Control-Max-Age': '86400',
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
	});
}

// DB 行 -> API 记录（字段名与前端一致，便于映射）
function rowToRecord(r) {
	const rec = {
		Table: r.tbl, Year: r.yr, Month: r.mo, Day: r.dy, Level: r.lvl,
		N1: r.n1, N2: r.n2, N3: r.n3, Comment: r.comment,
		updated_at: r.updated_at, deleted: r.deleted,
	};
	if (r.usr !== undefined) rec.user = r.usr; // admin 拉取时带上用户
	return rec;
}

async function pull(env, usr, since, admin) {
	if (admin) {
		const { results } = await env.DB.prepare(
			`SELECT usr,tbl,yr,mo,dy,lvl,n1,n2,n3,comment,updated_at,deleted
			 FROM records WHERE updated_at > ? ORDER BY updated_at ASC`
		).bind(since).all();
		return results.map(rowToRecord);
	}
	const { results } = await env.DB.prepare(
		`SELECT tbl,yr,mo,dy,lvl,n1,n2,n3,comment,updated_at,deleted
		 FROM records WHERE usr = ? AND updated_at > ? ORDER BY updated_at ASC`
	).bind(usr, since).all();
	return results.map(rowToRecord);
}

// last-write-wins 覆盖：只有当传入的 updated_at 不早于现有记录时才生效
async function pushOne(env, usr, rec) {
	await env.DB.prepare(
		`INSERT INTO records (usr,tbl,yr,mo,dy,lvl,n1,n2,n3,comment,updated_at,deleted)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
		 ON CONFLICT(usr,tbl,yr,mo,dy,lvl) DO UPDATE SET
		   n1=excluded.n1, n2=excluded.n2, n3=excluded.n3, comment=excluded.comment,
		   updated_at=excluded.updated_at, deleted=excluded.deleted
		 WHERE excluded.updated_at >= records.updated_at`
	).bind(
		usr, rec.Table, rec.Year | 0, rec.Month | 0, rec.Day | 0, rec.Level | 0,
		rec.N1 | 0, rec.N2 | 0, rec.N3 | 0, rec.Comment || '',
		rec.updated_at | 0, rec.deleted ? 1 : 0
	).run();
}

export async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;

	if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

	const appOk = !env.APP_KEY || request.headers.get('X-App-Key') === env.APP_KEY;
	const adminOk = !!env.ADMIN_KEY && request.headers.get('X-Admin-Key') === env.ADMIN_KEY;

	try {
		if (path === '/api/health') return json({ ok: true, now: Date.now() });

		if (path === '/api/pull' && request.method === 'GET') {
			if (!appOk) return json({ error: 'bad app key' }, 401);
			const usr = url.searchParams.get('user');
			const since = Number(url.searchParams.get('since') || 0);
			if (!usr) return json({ error: 'user required' }, 400);
			return json({ records: await pull(env, usr, since, false), now: Date.now() });
		}

		if (path === '/api/push' && request.method === 'POST') {
			if (!appOk) return json({ error: 'bad app key' }, 401);
			const body = await request.json();
			const usr = body.user;
			const recs = Array.isArray(body.records) ? body.records : [];
			if (!usr) return json({ error: 'user required' }, 400);
			for (const rec of recs) await pushOne(env, usr, rec);
			return json({ applied: recs.length, now: Date.now() });
		}

		if (path === '/api/admin/pull' && request.method === 'GET') {
			if (!adminOk) return json({ error: 'bad admin key' }, 401);
			const since = Number(url.searchParams.get('since') || 0);
			return json({ records: await pull(env, null, since, true), now: Date.now() });
		}

		if (path === '/api/admin/users' && request.method === 'GET') {
			if (!adminOk) return json({ error: 'bad admin key' }, 401);
			const { results } = await env.DB.prepare(
				`SELECT usr, COUNT(*) AS cnt, MAX(updated_at) AS last
				 FROM records WHERE deleted = 0 GROUP BY usr ORDER BY last DESC`
			).all();
			return json({ users: results });
		}

		return json({ error: 'not found' }, 404);
	} catch (e) {
		return json({ error: String((e && e.message) || e) }, 500);
	}
}

export default { fetch: handleRequest };
