/*
 * sw.js — Service Worker：把整个 app 缓存到本地，实现完全离线。
 * 更新静态文件后，请把 CACHE 的版本号 +1（如 cc-v2），旧缓存会自动清理。
 */
var CACHE = 'cc-v9';

var ASSETS = [
	"./",
	"train.html",
	"teach.html",
	"admin.html",
	"manifest.json",
	"favicon.ico",
	"css/bootstrap.min.css",
	"css/example_weui.css",
	"css/style.css",
	"css/weui.min.css",
	"fonts/glyphicons-halflings-regular.woff",
	"js/bootstrap.min.js",
	"js/db.js",
	"js/jquery-1.8.3.min.js",
	"js/train.js",
	"sound/counting_1.mp3",
	"sound/counting_1.ogg",
	"sound/counting_1.wav",
	"sound/counting_2.mp3",
	"sound/counting_2.ogg",
	"sound/counting_2.wav",
	"img/avatar.png",
	"img/login.png",
	"img/login-icon.png",
	"img/icon-180.png",
	"img/icon-192.png",
	"img/icon-512.png",
	"img/dlc1.png", "img/dlc2.png", "img/dlc3.png", "img/dlc4.png", "img/dlc5.png",
	"img/dlc6.png", "img/dlc7.png", "img/dlc8.png", "img/dlc9.png", "img/dlc10.png",
	"img/fwc1.png", "img/fwc2.png", "img/fwc3.png", "img/fwc4.png", "img/fwc5.png",
	"img/fwc6.png", "img/fwc7.png", "img/fwc8.png", "img/fwc9.png", "img/fwc10.png",
	"img/jt1.png", "img/jt2.png", "img/jt3.png", "img/jt4.png", "img/jt5.png",
	"img/jt6.png", "img/jt7.png", "img/jt8.png", "img/jt9.png", "img/jt10.png",
	"img/q1.png", "img/q2.png", "img/q3.png", "img/q4.png", "img/q5.png",
	"img/q6.png", "img/q7.png", "img/q8.png", "img/q9.png", "img/q10.png",
	"img/sd1.png", "img/sd2.png", "img/sd3.png", "img/sd4.png", "img/sd5.png",
	"img/sd6.png", "img/sd7.png", "img/sd8.png", "img/sd9.png", "img/sd10.png",
	"img/ytxs1.png", "img/ytxs2.png", "img/ytxs3.png", "img/ytxs4.png", "img/ytxs5.png",
	"img/ytxs6.png", "img/ytxs7.png", "img/ytxs8.png", "img/ytxs9.png", "img/ytxs10.png"
];

// 逐个缓存，单个失败不影响整体安装
self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(CACHE).then(function(cache) {
			return Promise.all(ASSETS.map(function(url) {
				return cache.add(url).catch(function(err) {
					console.log('SW cache skip: ' + url + ' (' + err + ')');
				});
			}));
		}).then(function() { return self.skipWaiting(); })
	);
});

// 清理旧版本缓存
self.addEventListener('activate', function(e) {
	e.waitUntil(
		caches.keys().then(function(keys) {
			return Promise.all(keys.filter(function(k) {
				return k !== CACHE;
			}).map(function(k) { return caches.delete(k); }));
		}).then(function() { return self.clients.claim(); })
	);
});

// stale-while-revalidate：先用缓存秒开，同时后台拉最新存入缓存，下次即为新版
// （配合页面里的自动刷新，更新能可靠地传到手机，不会一直卡在旧版本）
self.addEventListener('fetch', function(e) {
	var req = e.request;
	if (req.method !== 'GET') return;
	if (new URL(req.url).origin !== self.location.origin) return;

	e.respondWith(
		caches.open(CACHE).then(function(cache) {
			return cache.match(req).then(function(cached) {
				var network = fetch(req).then(function(resp) {
					if (resp && resp.status === 200 && resp.type === 'basic') {
						cache.put(req, resp.clone());
					}
					return resp;
				}).catch(function() { return cached; });
				return cached || network;
			});
		})
	);
});
