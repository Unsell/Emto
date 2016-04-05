define(["jquery","datetimepicker"],function($){
	$.fn.datetimepicker.dates['zh'] = {
		days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
		daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
		daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
		months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		meridiem: ["上午", "下午"],
		//suffix:      ["st", "nd", "rd", "th"],  
		today: "今天"
	};
	var days = {
		"0": "星期日", 
		"1": "星期一",
		"2": "星期二",
		"3": "星期三",
		"4": "星期四",
		"5": "星期五",
		"6": "星期六"
	};
	var same = {
		loginUrl: "./login.html"
	}
	function FormatDate(strTime) {
		var date = new Date(strTime);
		return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);
	}
	function dateCompare(startdate, enddate) {
		var arr = startdate.split("-");
		var starttime = new Date(arr[0], arr[1], arr[2]);
		var starttimes = starttime.getTime();
		var arrs = enddate.split("-");
		var lktime = new Date(arrs[0], arrs[1], arrs[2]);
		var lktimes = lktime.getTime();
		if (starttimes >= lktimes) {
			return false;
		} else
			return true;
	}
	function GetDateStr(AddDayCount) {
		var dd = new Date();
		dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期    
		var y = dd.getFullYear();
		var m = ("0" + (dd.getMonth() + 1)).slice(-2); //获取当前月份的日期    
		var d = ("0" + (dd.getDate())).slice(-2);
		return y + "-" + m + "-" + d;
	}
	function setDateTime(d) {
		var vYear = d.getFullYear();
		var vMon = d.getMonth() + 1;
		var vDay = d.getDate();
		var vWeek = days[d.getDay()];
		$(".left_time .week").html(vWeek);
		$(".left_time [data-name=day]").html(vDay);
		$(".left_time [data-name=month]").html(vMon);
		$(".left_time [data-name=year]").html(vYear);
		$('#datetimepicker').datetimepicker('update', FormatDate(d));
	}
	function datetimepicker(sdate,edate,lsdate,ledate){
		lsdate || (lsdate = "1971-01-01");
		ledate || (ledate = "2100-12-31");
		//起止时间
		$(".startDatetime").datetimepicker({
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate", function(e) {
			$(".startDatetime").attr("data-sdate", FormatDate(e.date));
			$('.endDatetime').datetimepicker('setStartDate', FormatDate(e.date));
			if (!dateCompare($(".startDatetime").attr("data-sdate"), $('.endDatetime').attr("data-edate"))) {
				$('.endDatetime').datetimepicker('update', FormatDate(e.date));
				$(".endDatetime").attr("data-edate", FormatDate(e.date));
			}
		});
		$(".endDatetime").datetimepicker({
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate", function(e) {
			$(".endDatetime").attr("data-edate", FormatDate(e.date));
		});
		//时间选择框初始化
		$('.startDatetime').attr('data-sdate', sdate);
		$('.endDatetime').attr('data-edate', edate);
		$('.startDatetime').datetimepicker('update', sdate);
		$('.endDatetime').datetimepicker('update', edate);
		//设置时间范围
		$('.startDatetime').datetimepicker('setStartDate', lsdate);
		$('.endDatetime').datetimepicker('setStartDate', sdate);
		$('.startDatetime').datetimepicker('setEndDate', ledate);
		$('.endDatetime').datetimepicker('setEndDate', ledate);
	}
	function limitdatetimepicker(sdate,edate,lsdate,ledate){
		lsdate || (lsdate = "1971-01-01");
		ledate || (ledate = "2100-12-31");
		//起止时间
		$(".startDatetime").datetimepicker({
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate", function(e) {
			$(".startDatetime").attr("data-sdate", FormatDate(e.date));
			$('.endDatetime').datetimepicker('setStartDate', FormatDate(e.date));
			if (!dateCompare($(".startDatetime").attr("data-sdate"), $('.endDatetime').attr("data-edate"))) {
				$('.endDatetime').datetimepicker('update', FormatDate(e.date));
				$(".endDatetime").attr("data-edate", FormatDate(e.date));
			}
		});
		$(".endDatetime").datetimepicker({
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate", function(e) {
			$(".endDatetime").attr("data-edate", FormatDate(e.date));
		});
		//时间选择框初始化
		$('.startDatetime').attr('data-sdate', sdate);
		$('.endDatetime').attr('data-edate', edate);
		$('.startDatetime').datetimepicker('update', sdate);
		$('.endDatetime').datetimepicker('update', edate);
		//设置时间范围
		$('.startDatetime').datetimepicker('setStartDate', lsdate);
		$('.endDatetime').datetimepicker('setStartDate', sdate);
		$('.startDatetime').datetimepicker('setEndDate', ledate);
		$('.endDatetime').datetimepicker('setEndDate', ledate);
	}
	function getDateDiff(startTime,endTime){  
		var startDate = new Date(startTime);
		var endDate = new Date(endTime);
		var todayDate = new Date();
		todayDate = new Date(todayDate.toLocaleDateString());
		if (todayDate > endDate) {
			return -1;
		} else if (todayDate < startDate) {
			var days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
		} else {
			var days = Math.ceil((endDate - todayDate) / (1000 * 60 * 60 * 24));
		}
		//var days = (endTime - startTime)/(1000*60*60*24);
		return  days;    
	};
	function phoneTest(str){//手机号格式判断
		if(/^1\d{10}$/.test(str)){
			return true;
		}else {
			return false;
		}
	}
	function logout(){
		$(document).on("click",".logout-btn",function(e){
			e.preventDefault();
			var data = {
				token: localStorage.token,
				userName: userData.phone
			}
			$.post("/LoginManage.aspx?method=SignOut",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						localStorage.autologin = 0;
						location.href = same.loginUrl;
						break;
				}
			});
		});	
	}
	return {
		"datetimepicker": datetimepicker,
		"limitdatetimepicker": limitdatetimepicker,
		"getDateDiff": getDateDiff,
		"GetDateStr": GetDateStr,
		"FormatDate": FormatDate,
		"days": days,
		"phoneTest": phoneTest,
		"setDateTime": setDateTime,
		"logout": logout,
		"same": same
	};
});