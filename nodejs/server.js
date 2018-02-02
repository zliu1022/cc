/*打印下默认的模块加载路径*/
/*console.log(process.mainModule.paths);*/

const low = require('C:\\Users\\TVU_user\\AppData\\Roaming\\npm\\node_modules\\lowdb')
var db = low('ex.json')

var pushup = db.get('PUSHUP')
var bridge = db.get('BRIDGE')
var legraise = db.get('LEGRAISE')
var squat = db.get('SQUAT')
var pullup = db.get('PULLUP')
var handstand = db.get('HANDSTAND')
var basin = db.get('BASIN')

var table = pushup;

var express = require('C:\\Users\\TVU_user\\AppData\\Roaming\\npm\\node_modules\\express');
var app = express();
var bodyParser = require('C:\\Users\\TVU_user\\AppData\\Roaming\\npm\\node_modules\\body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: false
})
app.use(express.static('public'));

response_error = {
	result: "error",
	remark: ""
};
response_ok = {
	result: "ok"
};

app.get('/*', function(req, res) {

	/*
	req.route.path
	req._parsedUrl.pathname
	req._parsedOriginalUrl.pathname
	 */
	console.log("--------------------------------------------------");
	console.log("GET: ");
	console.log("req.route.path: " + req.route.path);
	console.log("req._parsedUrl.path: " + req._parsedUrl.pathname);
	console.log("req._parsedOriginalUrl.path: " + req._parsedOriginalUrl.pathname);
	console.log("req.query: " + JSON.stringify(req.query));

	var pathname = req._parsedUrl.pathname;

	if(pathname == '/PUSHUP') {
		table = pushup;
	} else if(pathname == '/BRIDGE') {
		table = bridge;
    } else if(pathname == '/LEGRAISE') {
		table = legraise;
	} else if(pathname == '/SQUAT') {
		table = squat;
	} else if(pathname == '/PULLUP') {
		table = pullup;
	} else if(pathname == '/HANDSTAND') {
		table = handstand;
	} else if(pathname == '/BASIN') {
		table = basin;
	} else if (pathname == '/newdb') {
        console.log('change db to ' + req.query.Name + ' Password: ' + req.query.Password);
        
		db = low(req.query.Name +'.json')
		
		db.defaults({ PUSHUP: [] })
		  .value()				
		db.defaults({ BRIDGE: [] })
		  .value()
		db.defaults({ LEGRAISE: [] })
		  .value()
		db.defaults({ SQUAT: [] })
		  .value()
		db.defaults({ PULLUP: [] })
		  .value()
		db.defaults({ HANDSTAND: [] })
		  .value()
		db.defaults({ BASIN: [] })
		  .value()
		
		pushup = db.get('PUSHUP')
		bridge = db.get('BRIDGE')
		legraise = db.get('LEGRAISE')
		squat = db.get('SQUAT')
		pullup = db.get('PULLUP')
		handstand = db.get('HANDSTAND')
		basin = db.get('BASIN')
		
		table = pushup;

		var s = JSON.stringify(response_ok);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback')
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
    } else if (pathname == '/newtable') {
		db.defaults({ PUSHUP: [] })
            .value()
        console.log('new table')

		var s = JSON.stringify(response_ok);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback')
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
    } else if (pathname == '/deltable') {
		var ret = table
			.remove()
			.value()
		console.log('del table');
		if (ret.length) {
			console.log(ret.length + " records")
		}

		var s = JSON.stringify(response_ok);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback')
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
	} else if (pathname == '/addrecord') {
		var ret = table
		.push({ "Year": 2016, "Month": 1, "Day": 1,  "Level": 1, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 1, "Day": 8,  "Level": 1, "N1": 4, "N2": 5, "N3": 6,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 1, "Day": 15, "Level": 1, "N1": 7, "N2": 8, "N3": 9,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 1, "Day": 22, "Level": 1, "N1": 10, "N2": 11, "N3": 12,"Comment": '问题"还是"来了' })
		.push({ "Year": 2016, "Month": 1, "Day": 29, "Level": 1, "N1": 13, "N2": 14, "N3": 15,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 2, "Day": 5,  "Level": 2, "N1": 2, "N2": 3, "N3": 4,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 2, "Day": 12, "Level": 2, "N1": 8, "N2": 9, "N3": 10,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 2, "Day": 19, "Level": 2, "N1": 11, "N2": 12, "N3": 13,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 2, "Day": 26, "Level": 2, "N1": 12, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 3, "Day": 4,  "Level": 3, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 3, "Day": 11, "Level": 3, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 3, "Day": 18, "Level": 3, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 3, "Day": 25, "Level": 3, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 4, "Day": 1,  "Level": 4, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 4, "Day": 8,  "Level": 4, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 4, "Day": 15, "Level": 4, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 4, "Day": 22, "Level": 4, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		.push({ "Year": 2016, "Month": 4, "Day": 29, "Level": 4, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 5, "Day": 6,  "Level": 5, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 5, "Day": 13, "Level": 5, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 5, "Day": 20, "Level": 5, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 5, "Day": 27, "Level": 5, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 6, "Day": 3,  "Level": 6, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 6, "Day": 10, "Level": 6, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 6, "Day": 17, "Level": 6, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 6, "Day": 24, "Level": 6, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 7, "Day": 1,  "Level": 7, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 7, "Day": 8,  "Level": 7, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 7, "Day": 15, "Level": 7, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 7, "Day": 22, "Level": 7, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		.push({ "Year": 2016, "Month": 7, "Day": 29, "Level": 7, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 8, "Day": 5,  "Level": 8, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 8, "Day": 12, "Level": 8, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 8, "Day": 19, "Level": 8, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 8, "Day": 26, "Level": 8, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 9, "Day": 9,  "Level": 9, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 9, "Day": 16, "Level": 9, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 9, "Day": 23, "Level": 9, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 9, "Day": 30, "Level": 9, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 10, "Day": 7,  "Level": 10, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 10, "Day": 14, "Level": 10, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 10, "Day": 21, "Level": 10, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 10, "Day": 28, "Level": 10, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 11, "Day": 4,  "Level": 1, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 11, "Day": 11, "Level": 2, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 11, "Day": 18, "Level": 3, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 11, "Day": 25, "Level": 4, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		
		.push({ "Year": 2016, "Month": 12, "Day": 2,  "Level": 5, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半一半一' })
		.push({ "Year": 2016, "Month": 12, "Day": 9,  "Level": 6, "N1": 1, "N2": 2, "N3": 3,"Comment": '下行桥但是只下了一半, 前侧链压力很大' })
		.push({ "Year": 2016, "Month": 12, "Day": 16, "Level": 7, "N1": 1, "N2": 2, "N3": 3,"Comment": '一二三四五六七八九十一二三一二三四五六七八九十一二三' })
		.push({ "Year": 2016, "Month": 12, "Day": 23, "Level": 8, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })
		.push({ "Year": 2016, "Month": 12, "Day": 30, "Level": 9, "N1": 2, "N2": 2, "N3": 3,"Comment": '问题"还是"来了' })


		.value()
	
		if(ret){
			console.log('add (' + ret.length + ') record ok')		
		} else {
			console.log('add record failed')
		}
		var s = JSON.stringify(response_ok);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback');
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
	} else {
		response_error.remark = "unknown command (内调不会出这个错误)";
		var s = JSON.stringify(response_error);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback');
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
	}
	
	var result;
	if( req.query.Year && req.query.Month && req.query.Day ) {
		/*查询当天*/
		var year = parseInt(req.query.Year);
		var month = parseInt(req.query.Month);
		var day = parseInt(req.query.Day);
		console.log("query " + year + "-" + month + "-" + day);
		result = table
	        .filter({ "Year": year, "Month": month, "Day": day })
			.orderBy('Level', 'desc')
			.take(10)
			.value()
	} else {
		/*查询全部*/
		console.log("query all records");
		result = table
		.orderBy(['Year', 'Month', 'Day', 'Level'], ['desc', 'desc', 'desc', 'desc'])
		.value()
	}
	console.log(result.length + " records queried");

	var s;
	if (result.length==0) {
		response_error.remark = "no record return (查不到数据)";
		s = JSON.stringify(response_error);
	} else {
		s = JSON.stringify(result);
	}
    var str;
    if (req.query.callback) {
    	console.log('return callback');
        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
    } else {
    	str = s;
    }
	res.end(str);

})

app.post('/*', urlencodedParser, function(req, res) {
	console.log("--------------------------------------------------");
    console.log("POST: ");
	console.log("req.route.path: " + req.route.path);
	console.log("req._parsedUrl.path: " + req._parsedUrl.pathname);
	/*console.log("req._parsedOriginalUrl.path: " + req._parsedOriginalUrl.pathname);*/
	console.log("req.query: " + JSON.stringify(req.query));
	console.log("req.body: " + JSON.stringify(req.body));

	var pathname = req._parsedUrl.pathname;

	if(pathname == '/PUSHUP') {
		table = pushup;
	} else if(pathname == '/BRIDGE') {
		table = bridge;
    } else if(pathname == '/LEGRAISE') {
		table = legraise;
	} else if(pathname == '/SQUAT') {
		table = squat;
	} else if(pathname == '/PULLUP') {
		table = pullup;
	} else if(pathname == '/HANDSTAND') {
		table = handstand;
	} else if(pathname == '/BASIN') {
		table = basin;
	} else {
		response_error.remark = "unknown command (内调不会出这个错误)";
		var s = JSON.stringify(response_error);
        var str;
	    if (req.query.callback) {
	    	console.log('return callback');
	        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
	    } else {
	    	str = s;
	    }
		res.end(str);
		return;
	}
	
	var result;
	if ( ( req.body.N1 && req.body.N1!=0 ) || 
	     ( req.body.N2 && req.body.N2!=0 ) || 
	     ( req.body.N3 && req.body.N3!=0) ) {
		/*只要有一个数量都存在，就进行更新操作,也可能是新增记录*/
		console.log("update or add record");
		var year = parseInt(req.body.Year);
		var month = parseInt(req.body.Month);
		var day = parseInt(req.body.Day);
		var level = parseInt(req.body.Level);
		var date = "";
	    date = year + "-" + month + "-" + day;

        var n1=0,n2=0,n3=0,comment="";
        if (req.body.N1) n1 = parseInt(req.body.N1);
        if (req.body.N2) n2 = parseInt(req.body.N2);
        if (req.body.N3) n3 = parseInt(req.body.N3);
        if (req.body.Comment) comment = req.body.Comment;
		result = table
	        .find({ "Year": year, "Month": month, "Day": day, "Level": level })
		    .value()

		if (result) {
			/*已有记录，进行更新*/
			result = table
	            .find({ "Year": year, "Month": month, "Day": day, "Level": level })
	            .assign({ "N1": n1, "N2": n2, "N3": n3, "Comment": comment})
		        .value()
			console.log('update 1 result (date: ' + date + ' + level: ' + level + ')')
			console.log('result: ' + JSON.stringify(result));
			
			var s;
			if (!result) {
				response_error.remark = "no record find (不会出现这个错误，除非同时2个客户端操作)";
				s = JSON.stringify(response_error);
			} else {
				s = JSON.stringify(result);
			}
		    var str;
		    if (req.query.callback) {
		    	console.log('return callback');
		        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
		    } else {
		    	str = s;
		    }
			res.end(str);
		} else {
			/*没有记录，进行添加*/
			console.log('no record find (date: ' + date + ' + level: ' + level + ')')
			console.log("add new record")
			
			result = table
			    .push({ "Year": year, "Month": month, "Day": day, "Level": level,
			            "N1": n1, "N2": n2, "N3": n3,"Comment": comment })
			    .value()
			console.log('result: ' + JSON.stringify(result));

			var s;
			if (result.length==0) {
				/*这个错误目前根本不会发生*/
				response_error.remark = "add record failed (增加数据失败，不可能出现)";
				s = JSON.stringify(response_error);
			} else {
				s = JSON.stringify(result);
			}
		    var str;
		    if (req.query.callback) {
		    	console.log('return callback');
		        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
		    } else {
		    	str = s;
		    }
			res.end(str);
		}
	} else {
		/*一个数量都不存在，删除操作*/
		console.log("del record");
		var year = parseInt(req.body.Year);
		var month = parseInt(req.body.Month);
		var day = parseInt(req.body.Day);
		var level = parseInt(req.body.Level);
		var date = "";
	    date = year + "-" + month + "-" + day;

		result = table
			.remove({ "Year": year, "Month": month, "Day": day, "Level": level })
			.value()

		if (result) {
			console.log('remove ok ' + result.length + ' results (date: ' + date + ' + level: ' + level + ')')
			console.log('- - - - - - - - - - -')
			for(var i=0; i<result.length; i++) {
				console.log('result[' + i + ']: ' + result[i])
				console.log(result[i])
				console.log('- - - - - - - - - - -')
			}

			var s;
			if (result.length==0) {
				response_error.remark = "no record to delete (没有可删除的数据，删除后返回了result，但length为0)";
				s = JSON.stringify(response_error);
			} else {
				s = JSON.stringify(result);
			}
		    var str;
		    if (req.query.callback) {
		    	console.log('return callback');
		        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
		    } else {
		    	str = s;
		    }
			res.end(str);
		} else {
			console.log('no record find (date: ' + date + ' + level: ' + level + ')')
			
			response_error.remark = "delete record failed, (删除后返回了无效的result)";
			var s = JSON.stringify(response_error);
		    var str;
		    if (req.query.callback) {
		    	console.log('return callback');
		        str = '/**/ typeof ' + req.query.callback + ' === \'function\' && ' + req.query.callback + '(' + s + ');'
		    } else {
		    	str = s;
		    }
			res.end(str);
		}
	}
	


})

var server = app.listen(32000, function() {

	var host = server.address().address
	var port = server.address().port

	console.log("please visit: http://%s:%s", host, port)

})