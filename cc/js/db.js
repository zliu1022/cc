/*
 * db.js — 本地优先(IndexedDB) + 云同步(Cloudflare Worker + D1)。
 *
 * - 读/写先走本地，界面秒开、离线可用。
 * - 写入后把改动 push 到云端；启动、登录、联网、写入后会 pull 云端更新。
 * - 冲突用 last-write-wins（按 updated_at）；删除用墓碑 deleted=1，保证能同步。
 * - 多用户按 Prison No.(user) 分区；APP_KEY 会进前端，仅用于挡机器人。
 *
 * 仍然对外暴露全局 CCDB，并把 train.js 里发往 /db/ 的 $.ajax 改道到本地，
 * 因此界面逻辑无需改动。
 */
window.CCDB = (function() {
	var DB_NAME = 'cc-tracker';
	var STORE = 'records';
	var VERSION = 1;

	// 云端配置
	var SYNC = {
		url: 'https://cc-sync.zliu1022.workers.dev',
		appKey: '3WJ7gsuf35'
	};

	var _user = 'guest';
	var _dbp = null;
	var _pushTimer = null;
	var _syncing = false, _pending = false;

	function now() { return Date.now(); }

	function open() {
		if (_dbp) return _dbp;
		_dbp = new Promise(function(resolve, reject) {
			var req = indexedDB.open(DB_NAME, VERSION);
			req.onupgradeneeded = function(e) {
				var db = e.target.result;
				if (!db.objectStoreNames.contains(STORE)) {
					var st = db.createObjectStore(STORE, {
						keyPath: ['user', 'table', 'Year', 'Month', 'Day', 'Level']
					});
					st.createIndex('by_user_table', ['user', 'table'], { unique: false });
				}
			};
			req.onsuccess = function(e) { resolve(e.target.result); };
			req.onerror = function(e) { reject(e.target.error); };
		});
		return _dbp;
	}

	function store(mode) {
		return open().then(function(db) {
			return db.transaction(STORE, mode).objectStore(STORE);
		});
	}

	function setUser(name) { _user = name || 'guest'; sync(); }
	function getUser() { return _user; }

	// ---------- 本地读（过滤掉墓碑） ----------
	function getAll(table) {
		return store('readonly').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.index('by_user_table').getAll(IDBKeyRange.only([_user, table]));
				req.onsuccess = function() {
					var rows = (req.result || []).filter(function(r) { return r.deleted !== 1; });
					rows.sort(function(a, b) {
						return (b.Year - a.Year) || (b.Month - a.Month) ||
						       (b.Day - a.Day) || (b.Level - a.Level);
					});
					resolve(rows);
				};
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	function getByDate(table, year, month, day) {
		return getAll(table).then(function(rows) {
			return rows.filter(function(r) {
				return r.Year === year && r.Month === month && r.Day === day;
			}).sort(function(a, b) { return b.Level - a.Level; }).slice(0, 10);
		});
	}

	// ---------- 本地写 ----------
	function writeRec(rec) {
		return store('readwrite').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.put(rec);
				req.onsuccess = function() { resolve(rec); };
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	function getByKey(key) {
		return store('readonly').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.get(key);
				req.onsuccess = function() { resolve(req.result || null); };
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	function allForUser(user) {
		return store('readonly').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.getAll();
				req.onsuccess = function() {
					resolve((req.result || []).filter(function(r) { return r.user === user; }));
				};
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	function put(table, r) {
		var rec = {
			user: _user, table: table,
			Year: r.Year, Month: r.Month, Day: r.Day, Level: r.Level,
			N1: r.N1, N2: r.N2, N3: r.N3, Comment: r.Comment || '',
			updated_at: now(), deleted: 0, dirty: 1
		};
		return writeRec(rec).then(function(v) { schedulePush(); return v; });
	}

	// 删除 = 写一条墓碑（deleted=1），这样删除也能同步到别的设备
	function remove(table, year, month, day, level) {
		var rec = {
			user: _user, table: table,
			Year: year, Month: month, Day: day, Level: level,
			N1: 0, N2: 0, N3: 0, Comment: '',
			updated_at: now(), deleted: 1, dirty: 1
		};
		return writeRec(rec).then(function() { schedulePush(); });
	}

	// ---------- 同步 ----------
	// 带超时的 fetch，避免网络卡住导致同步永久挂起
	function apiFetch(path, opts) {
		opts = opts || {};
		var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
		var timer = null;
		if (ctrl) { opts.signal = ctrl.signal; timer = setTimeout(function() { ctrl.abort(); }, 15000); }
		return fetch(SYNC.url + path, opts).then(
			function(r) { if (timer) clearTimeout(timer); return r; },
			function(e) { if (timer) clearTimeout(timer); throw e; }
		);
	}

	function schedulePush() {
		if (_pushTimer) clearTimeout(_pushTimer);
		_pushTimer = setTimeout(function() { _pushTimer = null; sync(); }, 600);
	}

	// 老数据（Phase 1 时期没有 updated_at）首次同步时标脏，好上传到云端
	function migrateIfNeeded(user) {
		var flag = 'cc_migrated_' + user;
		if (localStorage.getItem(flag)) return Promise.resolve();
		return allForUser(user).then(function(rows) {
			var jobs = rows.filter(function(r) { return r.updated_at === undefined; })
				.map(function(r) {
					r.updated_at = now(); r.deleted = r.deleted ? 1 : 0; r.dirty = 1;
					return writeRec(r);
				});
			return Promise.all(jobs);
		}).then(function() { localStorage.setItem(flag, '1'); });
	}

	function pushDirty(user) {
		return allForUser(user).then(function(rows) {
			var dirty = rows.filter(function(r) { return r.dirty; });
			if (!dirty.length) return;
			var records = dirty.map(function(r) {
				return {
					Table: r.table, Year: r.Year, Month: r.Month, Day: r.Day, Level: r.Level,
					N1: r.N1 | 0, N2: r.N2 | 0, N3: r.N3 | 0, Comment: r.Comment || '',
					updated_at: r.updated_at, deleted: r.deleted ? 1 : 0
				};
			});
			return apiFetch('/api/push', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-App-Key': SYNC.appKey },
				body: JSON.stringify({ user: user, records: records })
			}).then(function(resp) {
				if (!resp.ok) throw new Error('push ' + resp.status);
				return resp.json();
			}).then(function() {
				// 成功后清除 dirty（若期间未被再次修改）
				return Promise.all(dirty.map(function(r) {
					return getByKey([r.user, r.table, r.Year, r.Month, r.Day, r.Level]).then(function(cur) {
						if (cur && cur.updated_at === r.updated_at && cur.dirty) {
							cur.dirty = 0;
							return writeRec(cur);
						}
					});
				}));
			});
		});
	}

	function pullRemote(user) {
		var key = 'cc_since_' + user;
		var since = parseInt(localStorage.getItem(key) || '0', 10) || 0;
		return apiFetch('/api/pull?user=' + encodeURIComponent(user) + '&since=' + since, {
			headers: { 'X-App-Key': SYNC.appKey }
		}).then(function(resp) {
			if (!resp.ok) throw new Error('pull ' + resp.status);
			return resp.json();
		}).then(function(data) {
			var recs = (data && data.records) || [];
			var maxU = since, changed = 0;
			return Promise.all(recs.map(function(rr) {
				if (rr.updated_at > maxU) maxU = rr.updated_at;
				var k = [user, rr.Table, rr.Year, rr.Month, rr.Day, rr.Level];
				return getByKey(k).then(function(local) {
					if (!local || rr.updated_at > (local.updated_at || 0)) {
						changed++;
						return writeRec({
							user: user, table: rr.Table,
							Year: rr.Year, Month: rr.Month, Day: rr.Day, Level: rr.Level,
							N1: rr.N1 | 0, N2: rr.N2 | 0, N3: rr.N3 | 0, Comment: rr.Comment || '',
							updated_at: rr.updated_at, deleted: rr.deleted ? 1 : 0, dirty: 0
						});
					}
				});
			})).then(function() {
				if (maxU > since) localStorage.setItem(key, String(maxU));
				if (changed > 0 && window.dispatchEvent) {
					window.dispatchEvent(new CustomEvent('ccdb:synced', { detail: { changed: changed } }));
				}
			});
		});
	}

	function sync() {
		if (!SYNC.url) return Promise.resolve();
		if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve();
		if (_syncing) { _pending = true; return Promise.resolve(); }
		_syncing = true;
		var user = _user;
		return migrateIfNeeded(user)
			.then(function() { return pushDirty(user); })
			.then(function() { return pullRemote(user); })
			.catch(function(e) { console.log('CCDB sync: ' + e); })
			.then(function() { _syncing = false; if (_pending) { _pending = false; sync(); } });
	}

	if (typeof window !== 'undefined' && window.addEventListener) {
		window.addEventListener('online', function() { sync(); });
		if (typeof document !== 'undefined' && document.addEventListener) {
			document.addEventListener('visibilitychange', function() { if (!document.hidden) sync(); });
		}
		// 兜底：定期把仍是 dirty 的改动推上去、并拉取其它设备的更新（数据量极小，开销可忽略）
		setInterval(function() { sync(); }, 30000);
	}

	return {
		setUser: setUser, getUser: getUser,
		getAll: getAll, getByDate: getByDate,
		put: put, remove: remove, sync: sync
	};
})();

/*
 * 兼容层：把 train.js 里所有 $.ajax({url:'/db/...'}) 改道到 CCDB。
 * 保持原来的 success(data) / error(err) 回调约定，界面代码无需改动。
 */
(function($) {
	if (!$ || !$.ajax) return;
	var _ajax = $.ajax;

	function parseQuery(qs) {
		var out = {};
		if (!qs) return out;
		qs.split('&').forEach(function(pair) {
			if (!pair) return;
			var kv = pair.split('=');
			out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
		});
		return out;
	}

	function handleLocal(s) {
		var m = String(s.url).match(/^\/db\/([^?]*)(?:\?(.*))?$/);
		var path = m ? decodeURIComponent(m[1]) : '';
		var query = parseQuery(m ? m[2] : '');
		var method = (s.type || 'GET').toUpperCase();

		// 保持 jQuery 的 context 语义：success/error 里的 this 指向 settings.context
		var ctx = s.context || s;
		var done = function(data) { if (s.success) s.success.call(ctx, data); };
		var fail = function(e) { console.log('CCDB error: ' + e); if (s.error) s.error.call(ctx, e); };

		// 登录 / 切换用户
		if (path === 'newdb') {
			CCDB.setUser(query.Name || 'guest');
			return done({ result: 'ok' });
		}

		var table = path; // 锻炼名

		if (method === 'GET') {
			if (query.Year && query.Month && query.Day) {
				CCDB.getByDate(table, parseInt(query.Year), parseInt(query.Month), parseInt(query.Day)).then(done, fail);
			} else {
				CCDB.getAll(table).then(done, fail);
			}
			return;
		}

		// POST：有数量则新增/修改，三个数量都为空则删除（与原后端逻辑一致）
		var b = s.data || {};
		var year = parseInt(b.Year), month = parseInt(b.Month), day = parseInt(b.Day), level = parseInt(b.Level);
		var hasReps = (b.N1 && parseInt(b.N1) !== 0) ||
		              (b.N2 && parseInt(b.N2) !== 0) ||
		              (b.N3 && parseInt(b.N3) !== 0);
		if (hasReps) {
			CCDB.put(table, {
				Year: year, Month: month, Day: day, Level: level,
				N1: parseInt(b.N1) || 0, N2: parseInt(b.N2) || 0, N3: parseInt(b.N3) || 0,
				Comment: b.Comment || ''
			}).then(done, fail);
		} else {
			CCDB.remove(table, year, month, day, level).then(function() { done({ result: 'ok' }); }, fail);
		}
	}

	$.ajax = function(settings) {
		if (settings && typeof settings.url === 'string' && settings.url.indexOf('/db/') === 0) {
			handleLocal(settings);
			return; // 本 app 不使用 $.ajax 的返回值
		}
		return _ajax.apply(this, arguments);
	};
})(window.jQuery);
