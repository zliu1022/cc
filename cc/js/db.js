/*
 * db.js — 本地数据层（IndexedDB），替代原来的 Node/lowdb 服务器。
 *
 * 数据全部存在手机本地，彻底离线、不依赖任何服务器。
 *
 * 结构：一个对象仓库 records，主键为
 *   [user, table, Year, Month, Day, Level]
 * 这样"新增/修改"就是 put（按主键覆盖），"删除"就是 delete。
 * user   = 登录的 Prison No.（数据分区，多人互不影响）
 * table  = 锻炼名（PUSHUP / BRIDGE / ...）
 *
 * 对外暴露全局 CCDB，并顺带把 jQuery 里所有发往 /db/ 的 $.ajax 请求
 * 改写为本地操作，从而保持 train.js 的界面逻辑完全不变。
 */
window.CCDB = (function() {
	var DB_NAME = 'cc-tracker';
	var STORE = 'records';
	var VERSION = 1;

	var _user = 'guest';
	var _dbp = null;

	function open() {
		if (_dbp) return _dbp;
		_dbp = new Promise(function(resolve, reject) {
			var req = indexedDB.open(DB_NAME, VERSION);
			req.onupgradeneeded = function(e) {
				var db = e.target.result;
				if (!db.objectStoreNames.contains(STORE)) {
					var store = db.createObjectStore(STORE, {
						keyPath: ['user', 'table', 'Year', 'Month', 'Day', 'Level']
					});
					store.createIndex('by_user_table', ['user', 'table'], { unique: false });
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

	function setUser(name) { _user = name || 'guest'; }
	function getUser() { return _user; }

	// 查询某个锻炼的全部记录，按 年/月/日/级别 倒序（与原后端一致）
	function getAll(table) {
		return store('readonly').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.index('by_user_table').getAll(IDBKeyRange.only([_user, table]));
				req.onsuccess = function() {
					var rows = req.result || [];
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

	// 查询某一天的记录，按级别倒序，最多 10 条（与原后端一致）
	function getByDate(table, year, month, day) {
		return getAll(table).then(function(rows) {
			return rows.filter(function(r) {
				return r.Year === year && r.Month === month && r.Day === day;
			}).sort(function(a, b) {
				return b.Level - a.Level;
			}).slice(0, 10);
		});
	}

	// 新增或修改（按主键覆盖）
	function put(table, rec) {
		return store('readwrite').then(function(st) {
			return new Promise(function(resolve, reject) {
				var full = {
					user: _user, table: table,
					Year: rec.Year, Month: rec.Month, Day: rec.Day, Level: rec.Level,
					N1: rec.N1, N2: rec.N2, N3: rec.N3, Comment: rec.Comment || ''
				};
				var req = st.put(full);
				req.onsuccess = function() { resolve(full); };
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	// 删除某一天某级别的记录
	function remove(table, year, month, day, level) {
		return store('readwrite').then(function(st) {
			return new Promise(function(resolve, reject) {
				var req = st.delete([_user, table, year, month, day, level]);
				req.onsuccess = function() { resolve(); };
				req.onerror = function() { reject(req.error); };
			});
		});
	}

	return {
		setUser: setUser,
		getUser: getUser,
		getAll: getAll,
		getByDate: getByDate,
		put: put,
		remove: remove
	};
})();

/*
 * 兼容层：把 train.js 里所有 $.ajax({url:'/db/...'}) 改道到 CCDB。
 * 保持原来的 success(data) / error(err) 回调约定，因此界面代码无需改动。
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
