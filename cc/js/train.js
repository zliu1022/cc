// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt) { //author: meizz   
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

$(document).ready(function() {

	var ccidx = 99;
	var cclist = ["PUSHUP", "BRIDGE", "LEGRAISE", "SQUAT", "PULLUP", "HANDSTAND", "BASIN"];
	var ccimglist = ["fwc", "q", "jt", "sd", "ytxs", "dlc", "dlc"];
	
	//星期几和锻炼对应关系，0表示星期日
	var plan = ["REST", "#PULLUP", "#BRIDGE", "#HANDSTAND", "#LEGRAISE", "#SQUAT", "#PUSHUP"];

	var ccdetail = [
		["第一式 墙壁俯卧撑", "第二式 上斜俯卧撑", "第三式 膝盖俯卧撑", "第四式 半俯卧撑", "第五式 标准俯卧撑", "第六式 窄距俯卧撑", "第七式 偏重俯卧撑", "第八式 单臂半俯卧撑", "第九式 杠杆俯卧撑", "最终式 单臂俯卧撑"],
		["第一式 短桥", "第二式 直桥", "第三式 高低桥", "第四式 顶桥", "第五式 半桥", "第六式 标准桥", "第七式 下行桥", "第八式 上行桥", "第九式 合桥", "最终式 铁板桥"],
		["第一式 坐姿屈膝", "第二式 平卧抬膝", "第三式 平卧屈举腿", "第四式 平卧蛙举腿", "第五式 平卧直举腿", "第六式 悬垂屈膝", "第七式 悬垂屈举腿", "第八式 悬垂蛙举腿", "第九式 悬垂半举腿", "最终式 悬垂直举腿"],
		["第一式 肩倒立深蹲", "第二式 折刀深蹲", "第三式 支撑深蹲", "第四式 半深蹲", "第五式 标准深蹲", "第六式 窄距深蹲", "第七式 偏重深蹲", "第八式 单腿半深蹲", "第九式 单腿辅助深蹲", "最终式 单腿深蹲"],
		["第一式 垂直引体", "第二式 水平引体向上", "第三式 折刀引体向上", "第四式 半引体向上", "第五式 标准引体向上", "第六式 窄距引体向上", "第七式 偏重引体向上", "第八式 单臂半引体向上", "第九式 单臂辅助引体向上", "最终式 单臂引体向上"],
		["第一式 靠墙顶立", "第二式 乌鸦式", "第三式 靠墙倒立", "第四式 半倒立撑", "第五式 标准倒立撑", "第六式 窄距倒立撑", "第七式 偏重倒立撑", "第八式 单臂半倒立撑", "第九式 杠杆倒立撑", "最终式 单臂倒立撑"],
		["第一式 5秒", "第二式 10秒", "第三式 20秒", "第四式 30秒", "第五式 1分钟", "第六式 1分15秒", "第七式 1.5分钟", "第八式 2分钟", "第九式 2.5分钟", "最终式 3分钟"]
	];
	
	var cclevelcount =[
		[150, 120, 90, 50, 40, 40, 40, 40, 40, 100],
		[150, 120, 90, 50, 40, 30, 20, 16, 12, 60],
		[120, 105, 90, 75, 40, 30, 30, 30, 30, 60],
		[150, 120, 90, 100, 60, 40, 40, 40, 40, 100],
		[120, 90, 60, 30, 20, 20, 16, 16, 14, 12],
		[120, 60, 120, 40, 30, 24, 20, 16, 12, 10]
	];
	
	var level_time = [{
		prepare_time: 5,
		positive_time: 2,
		hold_time: 1,
		negative_time: 2,
		interval_time: 1
	}, {
		prepare_time: 10,
		positive_time: 4,
		hold_time: 5,
		negative_time: 4,
		interval_time: 10
	}, {
		prepare_time: 5,
		positive_time: 4,
		hold_time: 1,
		negative_time: 4,
		interval_time: 1
	}, {
		prepare_time: 5,
		positive_time: 4,
		hold_time: 2,
		negative_time: 4,
		interval_time: 1
	}, {
		prepare_time: 5,
		positive_time: 2,
		hold_time: 1,
		negative_time: 2,
		interval_time: 1
	}, {
		prepare_time: 5,
		positive_time: 2,
		hold_time: 1,
		negative_time: 2,
		interval_time: 1
	}, {
		prepare_time: 2,
		positive_time: 10,
		hold_time: 5,
		negative_time: 0,
		interval_time: 0
	}];

	var i_tdy_rec = 0;
	var ccname = cclist[ccidx];
	var ccimgname = ccimglist[ccidx];

	var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
	if(!db) {
		console.log("数据库创建失败！");
	} else {
		console.log("数据库创建成功！");
	}
	
	var today = new Date();
	var day = today.getDay();
	$(plan[day]).css("background-color", "orange");
	
	$("#PUSHUP").click(function() {
		ccidx = 0;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(0);
	});
	$("#BRIDGE").click(function() {
		ccidx = 1;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(1);
	});
	$("#LEGRAISE").click(function() {
		ccidx = 2;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(2);
	});
	$("#SQUAT").click(function() {
		ccidx = 3;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(3);
	});
	$("#PULLUP").click(function() {
		ccidx = 4;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(4);
	});
	$("#HANDSTAND").click(function() {
		ccidx = 5;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(5);
	});
	$("#BASIN").click(function() {
		ccidx = 6;
		ccname = cclist[ccidx];
		ccimgname = ccimglist[ccidx];
		newpage(6);
	});

	function newpage(idx) {
		if(ccidx < 7) {
			$("title").text(ccname);
			$(".page_title").text(ccname);
			$("#content").remove();
			$("#test").remove();
			$("#addrecord").show();
			//下面留着的代码，据说这才是正规的修改title的方式
			/*$("title").html('PUSHUP');*/
			/*document.title='PUSHUP';*/
			/*$(document).attr('title','PUSHUP');*/

			//更换“添加记录对话框”里面的级别内容
			/*JQuery获取和设置Select选项的常用方法总结: http://www.3lian.com/edu/2013/07-05/78804.html*/
			$("#level").empty();
			for(var i = 0; i < 10; i++) {
				$("#level").get(0).options.add(new Option(ccdetail[idx][i], i + 1));
			}

			//设置“212对话框”的默认节奏为selected， 并从数据库读取相应的212时长
			$("#level212").val(idx);
			$("#prepare_time").val(level_time[idx].prepare_time);
			$("#positive_time").val(level_time[idx].positive_time);
			$("#hold_time").val(level_time[idx].hold_time);
			$("#negative_time").val(level_time[idx].negative_time);
			$("#interval_time").val(level_time[idx].interval_time);

			/*
			db.transaction(function(tx) {
				var sqlstr = "CREATE TABLE IF NOT EXISTS " + ccname + " (date REAL unique, comment TEXT, level BYTE, n1 BYTE, n2 BYTE, n3 BYTE)";
				tx.executeSql(sqlstr, [],
					function(tx, result) {
						console.log('创建' + ccname + '表成功');
						updatedisplay(ccidx);
					},
					function(tx, error) {
						console.log('创建' + ccname + '表失败:' + error.message);
					}
				);
			});
			*/
			updatedisplay_network(ccidx);
		}

		console.log($("#PUSHUP").attr("value"));
		return;
	}
	
	function updatedisplay_network(idx) {
		console.log("updatedisplay_network: " + idx);
		
		$.ajax({
			dataType: 'jsonp',
			url: '/db/'+ cclist[idx],
			type: "GET",
			success: function(data) {
				/*console.log("success: " + JSON.stringify(data));*/
				console.log("success: " + data.length + " records return");
				$("#dbrecord").empty();
				
				for(var i = 0; i < data.length; i++) {
						console.log("记录" + i + ": " +
							data[i].Year + " " +
							data[i].Month + " " +
							data[i].Day + " " +
							data[i].Level + " " +
							data[i].N1 + " " +
							data[i].N2 + " " +
							data[i].N3 + " " +
							data[i].Comment
						);

						celldiv = $('<div></div>');
						celldiv.attr('class', 'weui_cell');

						var str = '<div>' + data[i].Month + '月' + data[i].Day + '日' + '</div>';
						hddiv = $(str);
						hddiv.attr('class', 'weui_cell_hd');
						hddiv.attr('style', 'width:25%;');

						str = '<div><img src="img/' + ccimglist[idx] + data[i].Level + '.png" alt="xxxxx" style="width:30px;"></div>';
						imgdiv = $(str);
						imgdiv.attr('class', 'weui_cell_bd');
						imgdiv.attr('style', 'width:15%;');
						
						/*
						str = "<div>级别" + data[i].Level + "</div>";
						leveldiv = $(str);
						leveldiv.attr('class', 'weui_cell_bd');
						leveldiv.attr('style', 'width:20%;');

						str = "<div>" + data[i].N1 + "</div>";
						n1div = $(str);
						n1div.attr('class', 'weui_cell_ft');
						n1div.attr('style', 'width:10%;');

						str = "<div>" + data[i].N2 + "</div>";
						n2div = $(str);
						n2div.attr('class', 'weui_cell_ft');
						n2div.attr('style', 'width:10%;');

						str = "<div>" + data[i].N3 + "</div>";
						n3div = $(str);
						n3div.attr('class', 'weui_cell_ft');
						n3div.attr('style', 'width:10%;');
						*/
						embedcell = $('<div></div>');

						upcell = $('<div></div>');
						upcell.attr('class', 'weui_cell');
						upcell.attr('style', 'width:150%;padding-bottom: 0;padding-left: 0;');
						
						str = "<div>级别" + data[i].Level + "</div>";
						leveldiv = $(str);
						leveldiv.attr('class', 'weui_cell_bd');
						leveldiv.attr('style', 'width:4rem;');

						str = "<div>" + data[i].N1 + "</div>";
						n1div = $(str);
						n1div.attr('class', 'weui_cell_ft');
						n1div.attr('style', 'width:2rem;');

						str = "<div>" + data[i].N2 + "</div>";
						n2div = $(str);
						n2div.attr('class', 'weui_cell_ft');
						n2div.attr('style', 'width:2rem;');

						str = "<div>" + data[i].N3 + "</div>";
						n3div = $(str);
						n3div.attr('class', 'weui_cell_ft');
						n3div.attr('style', 'width:2rem;');
						
						upcell.append(leveldiv);
						upcell.append(n1div);
						upcell.append(n2div);
						upcell.append(n3div);
						
						str = "<div>" + data[i].Comment + "</div>";
						downcell = $(str);
						downcell.attr('style', 'color: gray; font-size: 0.8rem;');
						
						embedcell.append(upcell);
						embedcell.append(downcell);

						celldiv.append(hddiv);
						celldiv.append(imgdiv);
						/*
						celldiv.append(leveldiv);
						celldiv.append(n1div);
						celldiv.append(n2div);
						celldiv.append(n3div);
						*/
						celldiv.append(embedcell);

						$("#dbrecord").append(celldiv);
						
						/*
						<div class="weui_cell">
						<div class="weui_cell_hd" style="width:40%;"></div>
						<div class="weui_cell_ft" style="color: gray; font-size: 0.8rem;">xxxx xxxx 对过去的完整梳理 xxxx</div>
						</div>
						*/
						/*
						celldiv = $('<div></div>');
						celldiv.attr('class', 'weui_cell');
						
						hddiv = $('<div></div>');
						hddiv.attr('class', 'weui_cell_hd');
						hddiv.attr('style', 'width:40%;');
						
						str = "<div>" + data[i].Comment + "</div>";
						n1div = $(str);
						n1div.attr('class', 'weui_cell_ft');
						n1div.attr('style', 'color: gray; font-size: 0.8rem;');
						
						celldiv.append(hddiv);
						celldiv.append(n1div);

						$("#dbrecord").append(celldiv);
						*/

					}
				
			},
			error: function(er) {
				console.log("error: " + JSON.stringify(er));
			}
		});
	}

	function updatedisplay(idx) {
		// 按照日期顺序查询整张数据表格，并显示到页面上
		$("#dbrecord").empty();
		db.transaction(function(tx) {
			var sqlstr = "select * from " + cclist[idx] + " order by date desc";
			tx.executeSql(sqlstr, [],
				function(tx, result) {
					//在这里对result 做你想要做的事情吧...........
					console.log('查询成功: ' + result.rows.length);
					console.log("        date  " + "level " + "n1 " + "n2 " + "n3 " + "comment");
					for(i = 0; i < result.rows.length; i++) {
						console.log("记录" + i + ": " +
							result.rows.item(i).date + " " +
							result.rows.item(i).level + "    " +
							result.rows.item(i).n1 + " " +
							result.rows.item(i).n2 + " " +
							result.rows.item(i).n3 + "  " +
							result.rows.item(i).comment
						);

						celldiv = $('<div></div>');
						celldiv.attr('class', 'weui_cell');

						var datestr = result.rows.item(i).date;
						var pos = datestr.search('-');
						monthstr = datestr.substr(pos + 1, datestr.length - pos - 1);
						monthstr = monthstr.replace(/^0/, "");
						monthstr = monthstr.replace('-', '月');
						monthstr = monthstr.concat('日');
						var str = '<div>' + monthstr + '</div>';
						hddiv = $(str);
						hddiv.attr('class', 'weui_cell_hd');
						hddiv.attr('style', 'width:25%;');

						str = '<div><img src="img/' + ccimglist[idx] + result.rows.item(i).level + '.png" alt="xxxxx" style="width:30px;"></div>';
						imgdiv = $(str);
						imgdiv.attr('class', 'weui_cell_bd');
						imgdiv.attr('style', 'width:15%;');

						str = "<div>级别" + result.rows.item(i).level + "</div>";
						leveldiv = $(str);
						leveldiv.attr('class', 'weui_cell_bd');
						leveldiv.attr('style', 'width:20%;');

						str = "<div>" + result.rows.item(i).n1 + "</div>";
						n1div = $(str);
						n1div.attr('class', 'weui_cell_ft');
						n1div.attr('style', 'width:10%;');

						str = "<div>" + result.rows.item(i).n2 + "</div>";
						n2div = $(str);
						n2div.attr('class', 'weui_cell_ft');
						n2div.attr('style', 'width:10%;');

						str = "<div>" + result.rows.item(i).n3 + "</div>";
						n3div = $(str);
						n3div.attr('class', 'weui_cell_ft');
						n3div.attr('style', 'width:10%;');

						celldiv.append(hddiv);
						celldiv.append(imgdiv);
						celldiv.append(leveldiv);
						celldiv.append(n1div);
						celldiv.append(n2div);
						celldiv.append(n3div);

						$("#dbrecord").append(celldiv);

					}
				},
				function(tx, error) {
					console.log('查询失败, 错误码：' + error.code + "  错误信息：" + error.message);
				}
			);
		});
		return;
	}

	// 添加记录， 首先获取今天日期， 在表格中查询是否已经有记录， 已经有则显示到对话框中， 没有则保持为空
	// 在接下去点击ok后， 如果原来有记录则使用update， 如果没有则使用insert， 弄了个全局标志
	$("#addrecord").click(function() {
		
		/*本地数据库操作*/
		/*
		var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
		if(!db) {
			console.log("数据库打开失败！");
		} else {
			console.log("数据库打开成功！");
		}

		var str = new Date().Format("yyyy-MM-dd");

		db.transaction(function(tx) {
			var sqlstr = "select * from " + ccname + " where date=\'" + str + "\'";
			tx.executeSql(sqlstr, [],
				function(tx, result) {
					console.log('查询' + ccname + '成功: ' + result.rows.length);
					console.log("date  " + "level " + "n1 " + "n2 " + "n3 " + "comment");
					for(i = 0; i < result.rows.length; i++) {
						console.log("记录" + i + ": " +
							result.rows.item(i).date + " " +
							result.rows.item(i).level + "    " +
							result.rows.item(i).n1 + " " +
							result.rows.item(i).n2 + " " +
							result.rows.item(i).n3 + "  " +
							result.rows.item(i).comment
						);
					}
					if(result.rows.length > 0) {
						$("#date").val(result.rows.item(0).date);
						$("#level").val(result.rows.item(0).level);
						$("#n1").val(result.rows.item(0).n1);
						$("#n2").val(result.rows.item(0).n2);
						$("#n3").val(result.rows.item(0).n3);
						$("#comment").val(result.rows.item(0).comment);
						$("#dialog").show();
						i_tdy_rec = 1; //表示原来就有记录， 后面的ok采用update方式
					} else {
						$("#date").val(str);
						$("#level").val();
						$("#n1").val();
						$("#n2").val();
						$("#n3").val();
						$("#comment").val();
						$("#dialog").show();
						i_tdy_rec = 0;
					}
				},
				function(tx, error) {
					console.log('查询' + ccname + '失败, 错误码：' + error.code + "  错误信息：" + error.message);
				}
			);
		});
		*/
		
		/*网络操作*/
		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();
		/*var str = year + '-' + month + '-' + day;*/
		var str = new Date().Format("yyyy-MM-dd");
		$.ajax({
			dataType: 'jsonp',
			url: '/db/' + ccname + '?Year=' + year + '&Month=' + month + '&Day=' + day,
			type: "GET",
			success: function(data) {
				/*console.log("success: " + JSON.stringify(data));*/
				console.log("success: " + data.length + " records return");
				
				if (data.length>0) {
					for(var i = 0; i < data.length; i++) {
						console.log("记录" + i + ": " +
							data[i].Year + " " +
							data[i].Month + " " +
							data[i].Day + " " +
							data[i].Level + " " +
							data[i].N1 + " " +
							data[i].N2 + " " +
							data[i].N3 + " " +
							data[i].Comment
						);
	
						$("#date").val(str);
						$("#level").val(data[0].Level);
						$("#n1").val(data[0].N1);
						$("#n2").val(data[0].N2);
						$("#n3").val(data[0].N3);
						$("#comment").val(data[0].Comment);
						$("#dialog").show();
						i_tdy_rec = 1; //表示原来就有记录， 后面的ok采用update方式
					}
				} else {
					$("#date").val(str);
					$("#level").val();
					$("#n1").val();
					$("#n2").val();
					$("#n3").val();
					$("#comment").val();
					$("#dialog").show();
					i_tdy_rec = 0;
				}
			},
			error: function(er) {
				console.log("error: " + JSON.stringify(er));
				alert("error: " + JSON.stringify(er));
			}
		});
		
		
		
	});

	$("#addrecord_ok").click(function() {
		var numstr = /^([1-9]\d|\d)$/;
		if((!numstr.test($("#n1").attr("value"))) && ($("#n1").attr("value").length != 0)) {
			alert("数量1 格式错误,输入范围: 0~99");
			return false;
		}
		if((!numstr.test($("#n2").attr("value"))) && ($("#n2").attr("value").length != 0)) {
			alert("数量2 格式错误,输入范围: 0~99");
			return false;
		}
		if((!numstr.test($("#n3").attr("value"))) && ($("#n3").attr("value").length != 0)) {
			alert("数量3 格式错误,输入范围: 0~99");
			return false;
		}

		var id = parseInt($("#id1").val());
		var str = $("#date").attr("value");
		var d = new Date(Date.parse(str.replace(/-/g, "/"))); 
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();

		/*本地数据库操作*/
		var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
		if(!db) {
			console.log("数据库打开失败！");
		} else {
			console.log("数据库打开成功！");
		}

		//如果3个数量都是空，数据库又有这个记录，就应该删除
		//需要增加代码： 如果3个数量都是空，也不应该添加这个记录,操作上也删除试试
		if(($("#n1").attr("value").length == 0) &&
			($("#n2").attr("value").length == 0) &&
			($("#n3").attr("value").length == 0)) {
				
			/*本地数据库操作*/
			/*
			db.transaction(function(tx) {
				var sqlstr = "delete from " + ccname + " where date=\'" + str + "\'";
				tx.executeSql(sqlstr, [],
					function(tx, result) {
						console.log('删除记录成功:  ' + str);
						updatedisplay(ccidx);
					},
					function(tx, error) {
						console.log('删除记录失败, 错误码：' + error.code + "  错误信息：" + error.message);
					}
				);
			});
			*/
			
			/*网络操作*/
			$.ajax({
				url: '/db/' + ccname + '?Year=6666&Month=77&Day=88&Level=99',
				type: "POST",
				data: {Year: year, Month: month, Day: day, Level: $("#level").val() },
				success: function(data) {
					console.log("success: " + JSON.stringify(data));
					updatedisplay_network(ccidx);
				},
				error: function(er) {
					console.log("error: " + JSON.stringify(er));
				}
			});
			$("#dialog").hide();
			return false;
		}

		/* 当修改当前日期时，需要动态查询表格， 如果数据库已经有记录则设置i_tdy_rec=1 */
		/*本地数据库操作*/
		/*
		if(i_tdy_rec == 1) {
			db.transaction(function(tx) {
				var sqlstr = "update " + ccname + " set comment = ? , level = ?, n1 = ?, n2 = ?, n3 = ? where date=\'" + str + "\'";
				tx.executeSql(sqlstr, [
						$("#comment").attr("value"),
						$("#level").attr("value"),
						$("#n1").attr("value"),
						$("#n2").attr("value"),
						$("#n3").attr("value")
					],
					function(tx, result) {
						console.log('更新记录成功:  ' + str);
						updatedisplay(ccidx);
					},
					function(tx, error) {
						console.log('更新记录失败, 错误码：' + error.code + "  错误信息：" + error.message);
					}
				);
			});
		} else {
			db.transaction(function(tx) {
				var sqlstr = "INSERT INTO " + ccname + " (date, comment, level, n1, n2, n3) VALUES (?,?,?,?,?,?)";
				tx.executeSql(sqlstr, [
						$("#date").attr("value"),
						$("#comment").attr("value"),
						$("#level").attr("value"),
						$("#n1").attr("value"),
						$("#n2").attr("value"),
						$("#n3").attr("value")
					],
					function(tx, result) {
						console.log('添加记录成功');
						updatedisplay(ccidx);
					},
					function(tx, error) {
						console.log('添加记录失败, 错误码：' + error.code + "  错误信息：" + error.message);
					}
				);
			});
		}
		*/
		
		$.ajax({
			url: '/db/' + ccname,
			type: "POST",
			data: {
				Year: year, Month: month, Day: day, 
				Level: $("#level").val(),
				N1: $("#n1").val(), N2: $("#n2").val(), N3: $("#n3").val(),
				Comment: $("#comment").val()
			},
			success: function(data) {
				console.log("success: " + JSON.stringify(data));
				updatedisplay_network(ccidx);
			},
			error: function(er) {
				console.log("error: " + JSON.stringify(er));
			}
		});

		$("#dialog").hide();
	});

	$("#addrecord_cancel").click(function() {
		$("#dialog").hide();
	});

	// 绑定了 日期输入框的  点击事件  还有 键盘更改时间， 手机上似乎只有一种事件
	// 一旦发生了变化， 则进行一次数据库查询， 并设置相应的i_tdy_rec = 1; //表示原来就有记录
	$("#date").bind('input propertychange', function() {
		var str = $("#date").attr("value");

		/*本地数据库操作*/
		/*
		var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
		if(!db) {
			console.log("数据库打开失败！");
		} else {
			console.log("数据库打开成功！");
		}

		db.transaction(function(tx) {
			var sqlstr = "select * from " + ccname + " where date=\'" + str + "\'";
			tx.executeSql(sqlstr, [],
				function(tx, result) {
					console.log('查询成功: ' + result.rows.length);
					console.log("date  " + "level " + "n1 " + "n2 " + "n3 " + "comment");
					for(i = 0; i < result.rows.length; i++) {
						console.log("记录" + i + ": " +
							result.rows.item(i).date + " " +
							result.rows.item(i).level + "    " +
							result.rows.item(i).n1 + " " +
							result.rows.item(i).n2 + " " +
							result.rows.item(i).n3 + "  " +
							result.rows.item(i).comment
						);
					}
					if(result.rows.length > 0) {
						$("#date").val(result.rows.item(0).date);
						$("#level").val(result.rows.item(0).level);
						$("#n1").val(result.rows.item(0).n1);
						$("#n2").val(result.rows.item(0).n2);
						$("#n3").val(result.rows.item(0).n3);
						$("#comment").val(result.rows.item(0).comment);
						$("#dialog").show();
						i_tdy_rec = 1; //表示原来就有记录， 后面的ok采用update方式
					} else {
						//$("#date").val(str);
						$("#level").val("");
						$("#n1").val("");
						$("#n2").val("");
						$("#n3").val("");
						$("#comment").val("");
						$("#dialog").show("");
						i_tdy_rec = 0;
					}
				},
				function(tx, error) {
					console.log('查询失败, 错误码：' + error.code + "  错误信息：" + error.message);
				}
			);
		});
		*/
		
		/*网络操作*/
		var d = new Date(Date.parse(str.replace(/-/g, "/"))); 
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();
		$.ajax({
			dataType: 'jsonp',
			url: '/db/' + ccname + '?Year=' + year + '&Month=' + month + '&Day=' + day,
			type: "GET",
			success: function(data) {
				/*console.log("success: " + JSON.stringify(data));*/
				console.log("success: " + data.length + " records return");
				
				if(data.length > 0) {
					for(var i = 0; i < data.length; i++) {
						console.log("记录" + i + ": " +
							data[i].Year + " " +
							data[i].Month + " " +
							data[i].Day + " " +
							data[i].Level + " " +
							data[i].N1 + " " +
							data[i].N2 + " " +
							data[i].N3 + " " +
							data[i].Comment
						);
	
						$("#date").val(str);
						$("#level").val(data[0].Level);
						$("#n1").val(data[0].N1);
						$("#n2").val(data[0].N2);
						$("#n3").val(data[0].N3);
						$("#comment").val(data[0].Comment);
						$("#dialog").show();
						i_tdy_rec = 1; //表示原来就有记录， 后面的ok采用update方式
					}
				}else{
					//$("#date").val(str);
					$("#level").val(1);
					$("#n1").val('');
					$("#n2").val('');
					$("#n3").val('');
					$("#comment").val('');
					$("#dialog").show();
					i_tdy_rec = 0;				
				}
			},
			error: function(er) {
				console.log("error: " + JSON.stringify(er));
			}
		});
	});
	
	$("#level").bind('input propertychange', function() {
		var str = $("#date").attr("value");
		var level = $("#level").attr("value");

		/*网络操作*/
		var d = new Date(Date.parse(str.replace(/-/g, "/"))); 
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();
		$.ajax({
			dataType: 'jsonp',
			url: '/db/' + ccname + '?Year=' + year + '&Month=' + month + '&Day=' + day,
			type: "GET",
			success: function(data) {
				/*console.log("success: " + JSON.stringify(data));*/
				console.log("success: " + data.length + " records return");

				/*$("#level").val(1);*/
				$("#n1").val('');
				$("#n2").val('');
				$("#n3").val('');
				$("#comment").val('');
				i_tdy_rec = 0;

				if(data.length > 0) {
					for(var i = 0; i < data.length; i++) {
						console.log("记录" + i + ": " +
							data[i].Year + " " +
							data[i].Month + " " +
							data[i].Day + " " +
							data[i].Level + " " +
							data[i].N1 + " " +
							data[i].N2 + " " +
							data[i].N3 + " " +
							data[i].Comment
						);
						
						if (data[i].Level == level) {
							$("#date").val(str);
							$("#level").val(data[i].Level);
							$("#n1").val(data[i].N1);
							$("#n2").val(data[i].N2);
							$("#n3").val(data[i].N3);
							$("#comment").val(data[i].Comment);
							i_tdy_rec = 1; //表示原来就有记录， 后面的ok采用update方式
						}
					}
				}
				$("#dialog").show();				
			},
			error: function(er) {
				console.log("error: " + JSON.stringify(er));
				alert("error: " + JSON.stringify(er));
			}
		});
	});

	$("#set212").click(function() {
		$("#dialog").hide();
		$("#set212dialog").show();
	});

	$("#set212_ok").click(function() {

		prepareTime = $("#prepare_time").val();
		positiveTime = $("#positive_time").val();
		holdTime = $("#hold_time").val();
		negativeTime = $("#negative_time").val();
		waitTime = $("#interval_time").val();
		jsq.set(prepareTime, positiveTime, holdTime, negativeTime, waitTime);
		
		prepareplan = prepareTime;
		positiveplan = positiveTime;
		holdplan = holdTime;
		negativeplan = negativeTime;
		waitplan = waitTime;
		totalplan = $("#repeat_time").val();

		$("#set212dialog").hide();
		$("#dialog").show();
	});

	$("#set212_cancel").click(function() {
		$("#set212dialog").hide();
		$("#dialog").show();
	});

	(function() {
		var jsq = {},
			counting = 0,
			prepareTime = 3,
			positiveTime = 2,
			holdTime = 1,
			negativeTime = 2,
			waitTime = 1,
			moveSound = $("#move-sound").get(0),
			holdSound = $("#hold-sound").get(0),
			canUse = moveSound.preload ? true : false,
			reps = 0,
			interval = 0,
			test = false;

		function startPrepare() {
			counting = 0;
			$("#count-text").css("font-size","x-large");
			$("#count-text").text('预备：' + prepareTime + '秒');
			interval = window.setInterval(function() {
				counting++;
				console.log("prepare " + counting);
				$("#count-text").text('预备：' + (prepareTime - counting) + '秒');
				if(counting >= prepareTime) {
					window.clearInterval(interval);
					console.log("prepare clearInterval");
					$("#count-text").text('开始');
					startPositive();
				}
			}, 1000);
		}

		function startPositive() {
			counting = 0;
			interval = window.setInterval(function() {
				counting++;
				moveSound.play();
				console.log("positive play " + counting);
				if(counting >= positiveTime) {
					window.clearInterval(interval);
					console.log("positive clearInterval " + counting);
					startHold();
				}
			}, 1000);
		}

		function startHold() {
			counting = 0;
			interval = window.setInterval(function() {
				counting++;
				holdSound.play();
				console.log("holdSound play " + counting);
				if(counting >= holdTime) {
					window.clearInterval(interval);
					console.log("holdSound clearInterval " + counting);
					startNegative();
				}
			}, 1000);
		}

		function startNegative() {
			counting = 0;
			interval = window.setInterval(function() {
				counting++;
				moveSound.play();
				console.log("negative play " + counting);
				if(counting >= negativeTime) {
					window.clearInterval(interval);
					console.log("negative clearInterval " + counting);
					if(!test) {
						reps++;
						$("#count-text").text('已做 ' + reps + '次');
						interval = window.setTimeout(startPositive, waitTime * 1000);
					} else {
						$("#toggle-count").removeClass('disabled');
						$("#sound-test").removeClass('disabled');
					}
				}
			}, 1000);
		}

		jsq.start = function(isTest) {
			test = isTest ? true : false;
			if(!canUse) {
				alert('你的微信不支持该功能，无法使用，抱歉。');
			} else {
				reps = 0;
				if(!test) {
					startPrepare();
				} else {
					startPositive();
				}
			}
		};

		jsq.stop = function() {
			window.clearInterval(interval);
			if(reps) {
				$("#rep").val(reps);
				//$("#record-modal").modal('show');
			}
		}

		jsq.set = function(prepare, positive, hold, negative, wait) {
			prepareTime = parseInt(prepare) ? parseInt(prepare) : 1;
			positiveTime = parseInt(positive) ? parseInt(positive) : 1;
			holdTime = parseInt(hold) ? parseInt(hold) : 1;
			negativeTime = parseInt(negative) ? parseInt(negative) : 1;
			waitTime = parseInt(wait) ? parseInt(wait) : 1;
		}

		window.jsq = jsq;
	})();

	$("#sound-test").click(function(event) {
		if($(this).hasClass('disabled')) return;
		$(this).addClass('disabled');
		$("#toggle-count").addClass('disabled');
		jsq.start(true);
	});

	$("#sound-test-playmove").click(function(event) {
		$("#move-sound").get(0).play();
	});

	$("#sound-test-playhold").click(function(event) {
		$("#hold-sound").get(0).play();
	});
	
	$("#sound-test-mh").click(function(event) {
		var moveaudio = document.getElementById("move-sound");
		var holdaudio = document.getElementById("hold-sound");
		moveaudio.play();
		holdaudio.play();
	});
	
	function pagelog(str){
		var logstr = "<p>" + str + "</p>";
		$(logstr).insertAfter("#testlog");
		console.log(logstr);
	};
	
	var timestamp=0, lasttimestamp=0;
	var deltatimestamp;

	var status=0;
	var prepareplan=2;
	var positiveplan=2, positivecount=0;
	var holdplan=2,     holdcount=0;
	var negativeplan=2, negativecount=0;
	var waitplan=2;
	var totalplan=2,    totalcount=0;
	$("#sound-play").click(function(event) {
		
		if ($("#sound-play").text() == 'Executing') {
			return;
		}
			
		var moveaudio = document.getElementById("move-sound");
		var holdaudio = document.getElementById("hold-sound");
		var idtimeout;
		playmovecount = 0;
		playholdcount = 0;
		mtotal=0; htotal=0;
		status=0;
		positivecount=0;
		holdcount=0;
		negativecount=0;
		totalcount=0;
		
		pagelog("----------------------- new -------------------------");

		moveaudio.onended = function(){
			lasttimestamp = timestamp;
			timestamp = Date.now();
			deltatimestamp = timestamp-lasttimestamp;

			if ( status==1 ) {
				pagelog("positive onended("+ positivecount +"): " + deltatimestamp + " ms");
				if(positivecount>=positiveplan){
					status=2;
					pagelog("------ positive "+ positivecount + "------");
					if (deltatimestamp<1000){
						idtimeout = setTimeout(function() {
							lasttimestamp = timestamp;
							timestamp = Date.now();
							holdcount++;
							pagelog("1->2 timeout-hold: " + (timestamp-lasttimestamp) + " ms");
							holdaudio.play();
						}, (1000-deltatimestamp));
					} else {
						lasttimestamp = timestamp;
						timestamp = Date.now();
						holdcount++;
						holdaudio.play();
					}
				}else{
					//pagelog("positivecount<positiveplan： move");
					if (deltatimestamp<1000){
						idtimeout = setTimeout(function() {
							lasttimestamp = timestamp;
							timestamp = Date.now();
							positivecount++;
							pagelog("timeout-positive: " + (timestamp-lasttimestamp) + " ms");
							moveaudio.play();
						}, (1000-deltatimestamp));
					} else {
						lasttimestamp = timestamp;
						timestamp = Date.now();
						positivecount++;
						moveaudio.play();
					}
				}
			}else if(status==3) {
				pagelog("negative onended("+ negativecount +"): " + deltatimestamp + " ms");
				if(negativecount>=negativeplan){
					pagelog("------ negative "+ negativecount + "------");
					status=4;
					positivecount=0;
					holdcount=0;
					negativecount=0;
					pagelog("3->4");
					pagelog("------------ finish: "+ totalcount + " -----------");
					$("#count-text").text('已做' + totalcount + '次');
					if (deltatimestamp<1000){
						idtimeout = setTimeout(function() {
							if(totalcount>=totalplan){
								totalcount=0;
								status=0;
								lasttimestamp = timestamp;
								timestamp = Date.now();
								pagelog("4->0 end: " + (timestamp-lasttimestamp) + " ms");
								$("#sound-play").text('start');
								$("#sound-play").css('background-color', 'cadetblue');
								moveaudio.onended = null;
								holdaudio.onended = null;
							}else{
								status=1;
								lasttimestamp = timestamp;
								timestamp = Date.now();
								pagelog("4->1 timeout-positive: " + (timestamp-lasttimestamp) + " ms");
								positivecount++;
								totalcount++;
								moveaudio.play();
							}
						}, (1000*waitplan)+(1000-deltatimestamp));
					} else {
						idtimeout = setTimeout(function() {
							if(totalcount>=totalplan){
								totalcount=0;
								status=0;
								lasttimestamp = timestamp;
								timestamp = Date.now();
								pagelog("4->0 end: " + (timestamp-lasttimestamp) + " ms");
								$("#sound-play").text('start');
								$("#sound-play").css('background-color', 'cadetblue');
								moveaudio.onended = null;
								holdaudio.onended = null;
							}else{
								status=1;
								lasttimestamp = timestamp;
								timestamp = Date.now();
								pagelog("4->1 timeout-positive: " + (timestamp-lasttimestamp) + " ms");
								positivecount++;
								totalcount++;
								moveaudio.play();
							}
						}, (1000*waitplan));
					}
				}else{
					if (deltatimestamp<1000){
						idtimeout = setTimeout(function() {
							lasttimestamp = timestamp;
							timestamp = Date.now();
							pagelog("timeout-negative: " + (timestamp-lasttimestamp) + " ms");
							negativecount++;
							moveaudio.play();
						}, (1000-deltatimestamp));
					} else {
						lasttimestamp = timestamp;
						timestamp = Date.now();
						negativecount++;
						moveaudio.play();
					}
				}
			}else{
				pagelog("move onended status error"+ status);
			}
		}
		
		holdaudio.onended = function(){
			lasttimestamp = timestamp;
			timestamp = Date.now();
			deltatimestamp = timestamp-lasttimestamp;
			htotal+=deltatimestamp;
			pagelog("hold onended("+ holdcount +"): " + deltatimestamp + " ms");

			if(holdcount>=holdplan){
				pagelog("------ hold "+ holdcount + "------");
				
				//zliu：增加一段来判断negativeplan=0的特殊情况
				if(negativeplan==0){

				status=1;
				if (deltatimestamp<1000){
					idtimeout = setTimeout(function() {
						if(totalcount>=totalplan){
							$("#count-text").text('已做' + totalcount + '次');
							totalcount=0;
							status=0;
							lasttimestamp = timestamp;
							timestamp = Date.now();
							pagelog("2->0 end: " + (timestamp-lasttimestamp) + " ms");
							$("#sound-play").text('start');
							$("#sound-play").css('background-color', 'cadetblue');
							moveaudio.onended = null;
							holdaudio.onended = null;
							
							positivecount = 0;
							holdcount = 0;
							negativecount = 0;
						} else {
							positivecount = 0;
							holdcount = 0;
							negativecount = 0;
							pagelog("3->4");
							pagelog("------------ finish: "+ totalcount + " -----------");
							$("#count-text").text('已做' + totalcount + '次');

							lasttimestamp = timestamp;
							timestamp = Date.now();
							pagelog("2->1 timeout-negative: " + (timestamp-lasttimestamp) + " ms");
							positivecount++;
							totalcount++;
							moveaudio.play();
						}
					}, (1000-deltatimestamp));
				}else{
					if(totalcount>=totalplan){
						$("#count-text").text('已做' + totalcount + '次');
						totalcount=0;
						status=0;
						lasttimestamp = timestamp;
						timestamp = Date.now();
						pagelog("2->0 end: " + (timestamp-lasttimestamp) + " ms");
						$("#sound-play").text('start');
						$("#sound-play").css('background-color', 'cadetblue');
						moveaudio.onended = null;
						holdaudio.onended = null;
						
						positivecount = 0;
						holdcount = 0;
						negativecount = 0;
					} else {
						positivecount = 0;
						holdcount = 0;
						negativecount = 0;
						pagelog("3->4");
						pagelog("------------ finish: "+ totalcount + " -----------");
						$("#count-text").text('已做' + totalcount + '次');
						
						pagelog("status: 2->1");
						lasttimestamp = timestamp;
						timestamp = Date.now();
						positivecount++;
						totalcount++;
						moveaudio.play();
					}
				}

				}else{

				status=3;
				if (deltatimestamp<1000){
					idtimeout = setTimeout(function() {
						lasttimestamp = timestamp;
						timestamp = Date.now();
						pagelog("2->3 timeout-negative: " + (timestamp-lasttimestamp) + " ms");
						negativecount++;
						moveaudio.play();
					}, (1000-deltatimestamp));
				}else{
					pagelog("status: 2->3");
					lasttimestamp = timestamp;
					timestamp = Date.now();
					negativecount++;
					moveaudio.play();
				}

				}

			}else{
				//pagelog("holdcount<holdplan： hold");
				if (deltatimestamp<1000){
					idtimeout = setTimeout(function() {
						lasttimestamp = timestamp;
						timestamp = Date.now();
						holdcount++;
						holdaudio.play();
					}, (1000-deltatimestamp));
				}else{
					lasttimestamp = timestamp;
					timestamp = Date.now();
					holdcount++;
					holdaudio.play();
				}
			}
		}

		status=0;
		lasttimestamp = timestamp;
		timestamp = Date.now();
		if ($("#sound-play").text() == 'start') {
			$("#sound-play").text('Executing');
			$("#sound-play").css('background-color', 'gray');
			$("#count-text").css("font-size","x-large");
			$("#count-text").text('预备... ...');
			idtimeout = setTimeout(function() {
				status=1;
				lasttimestamp = timestamp;
				timestamp = Date.now();
				pagelog("0->1 timeout-prepare: " + (timestamp-lasttimestamp) + " ms");
				$("#count-text").text('开始');
				
				//zliu:
				/*
				判断	positiveplan>0,则moveaudio.play();positivecount++;totalcount++;status=1;
					否则	判断 holdplan>0,则holdaudio.play();holdcount++;totalcount++;status=2;
						否则 判断 negativeplan>0,则moveaudio.play();negativecount++;totalcount++;status=3;
							否则 判断 waitplan>0, 则直接退出
								全部为0,直接退出
				*/
				moveaudio.play();
				positivecount++;
				totalcount++;
			}, (prepareplan*1000));
		}
	});

	$("#toggle-count").click(function(event) {
		if($(this).hasClass('disabled')) return;
		var action = $(this).data('action');
		if(action == 'start') {
			$(this).data('action', 'stop');
			//$("span", this).removeClass('glyphicon-play').addClass('glyphicon-stop');
			//$(this).removeClass('btn-primary').addClass('btn-danger');
			$(this).removeClass('weui_btn_primary').addClass('weui_btn_warn');
			$("#count-op").addClass('hide');
			$("#count-text").removeClass('hide');
			$("#toggle-count").text('停止');
			jsq.start();
		} else if(action == 'stop') {
			$(this).data('action', 'start');
			//$("span", this).removeClass('glyphicon-stop').addClass('glyphicon-play');
			//$(this).removeClass('btn-danger').addClass('btn-primary');
			$(this).removeClass('weui_btn_warn').addClass('weui_btn_primary');
			$("#count-text").addClass('hide');
			$("#count-op").removeClass('hide');
			$("#toggle-count").text('开始');
			jsq.stop();
		}
	});

	$("#level212").bind("change", function() {
		var level = $(this).val();

		$("#prepare_time").val(level_time[level].prepare_time);
		$("#positive_time").val(level_time[level].positive_time);
		$("#hold_time").val(level_time[level].hold_time);
		$("#negative_time").val(level_time[level].negative_time);
		$("#interval_time").val(level_time[level].interval_time);

		/*
		jsq.set(level_time[level].prepare_time, 
			level_time[level].positive_time, 
			level_time[level].hold_time, 
			level_time[level].negative_time, 
			level_time[level].interval_time);
		*/
	});
	
	$("#login").click(function(event) {
		$("#logindialog").show();
		
		/*把session id设置为无效*/
		sessionStorage.login = 0;
	});
	$("#login_ok").click(function(event) {
		
		if ( ($("#prisonnumber").val() == '0027') && ($("#password").val() == '123') ||
			($("#prisonnumber").val() == 'bb') ||
			($("#prisonnumber").val() == 'guest')
			) {
			
			$.ajax({
				dataType: 'jsonp',
				url: '/db/newdb' + '?Name=' + $("#prisonnumber").val() + '&Password=' + $("#password").val(),
				type: "GET",
				success: function(data) {
					console.log("success: " + JSON.stringify(data));
					$("#logindialog").hide();
					/*把session id设置为有效*/
					sessionStorage.login = 1;
					
					for(var i=0; i<cclist.length; i++) {
						$.ajax({
							dataType: 'jsonp',
							url: '/db/'+ cclist[i],
							type: "GET",
							context: $("#progress"+i),
							success: function(data) {
								//处理data数据
								console.log("success: " + JSON.stringify(data));
								var s = this.selector;
								var idx = parseInt(s.substr(9, s.length-9))
								if (data.length) {
									var total = data[0].N1 + data[0].N2 + data[0].N3;
									var level = data[0].Level;
									this.text("Level" + level + ": " + JSON.stringify(total) + "/" + cclevelcount[idx][level-1]);					
								} else {
									this.text("Level1: - " + "/" + cclevelcount[idx][0]);
								}
							},
							error: function(er) {
								console.log("error: " + JSON.stringify(er));
							}
						});
					}
					
					
				},
				error: function(er) {
					console.log("error: " + JSON.stringify(er));
				}
			});

		} else {
			alert("wrong password");
		}
	});
	/*获取session id，有效则隐藏logindialog*/
	if(sessionStorage.login == 1) {
		$("#logindialog").hide();

		for(var i=0; i<cclist.length; i++) {
			$.ajax({
				dataType: 'jsonp',
				url: '/db/'+ cclist[i],
				type: "GET",
				context: $("#progress"+i),
				success: function(data) {
					//处理data数据
					console.log("success: " + JSON.stringify(data));
					var s = this.selector;
					var idx = parseInt(s.substr(9, s.length-9))
					if (data.length) {
						var total = data[0].N1 + data[0].N2 + data[0].N3;
						var level = data[0].Level;
						this.text("Level" + level + ": " + JSON.stringify(total) + "/" + cclevelcount[idx][level-1]);					
					} else {
						this.text("Level1: - " + "/" + cclevelcount[idx][0]);
					}
				},
				error: function(er) {
					console.log("error: " + JSON.stringify(er));
				}
			});
		}
		
	}else{
		$("#logindialog").show();
	}

});