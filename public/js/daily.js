require.config({
    paths: {
        jquery: "jquery-2.1.4.min",
        tipsy: "jquery.tipsy",
        datetimepicker: "bootstrap-datetimepicker.min",
        underscore: "underscore-min",
        layer: "layer/layer"
    },
    urlArgs: "v=6",//设置版本号
    shim: {
    	"tipsy": {
    		deps: ["jquery"]
    	},
    	"datetimepicker": {
    		deps: ["jquery"]
    	},
    	"layer": {
    		deps: ["jquery"]
    	}
    }
});
require(["jquery","common","tipsy","datetimepicker","underscore","layer"],function($,common){
	$(document).ready(function(){
		if(localStorage.token && localStorage.username){
			var data = {
				userName: localStorage.username,
				token: localStorage.token
			}
			$.post("/LoginManage.aspx?method=TokenLogin",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						location.href = common.same.loginUrl;
						break;
					case "1"://登录成功
						userData = JSON.parse(d.ResultString);
						callback();
						break;
					case "2":
						location.href = common.same.loginUrl;
						break;
				}
			});		
		}else{
			location.href = common.same.loginUrl;
		}
	});
	function callback() {
		layer.config({
		    path: '../public/js/layer/'
		});
		//初始化头部内容
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".name_ttsyp").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		$("._tt_selectyearplan .radius_img50").html(userData.nickName);
		$(".department_ttsyp").html(userData.teamShortName);
		common.logout();
		//时间初始化
		var dd = new Date(common.GetDateStr(0).replace(/-/g, "/"));
		var y = dd.getFullYear();
		var m = ("0" + (dd.getMonth() + 1)).slice(-2); //获取当前月份的日期    
		var d = ("0" + (dd.getDate())).slice(-2);
		$(".dropdown-toggle span").html(y);
		$("._tt_side_subnav li:eq("+ (parseInt(m)-1) + ")").addClass("active");//选中当前月份
		var yearArray = [y-2,y-1,y,y+1];//设置4个年份
		$(".dropdown_ssw a").each(function(i){
			$(this).html(yearArray[i]);
		});

		$(".date_hd").datetimepicker({//时间框
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate",function(e){
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "1":
					setDailyMe(common.FormatDate(e.date));
					break;
				case "2":
					setDailyTeam(common.FormatDate(e.date));
			}
			
		});
		$(".date_hd").datetimepicker("setStartDate", y-2 + "-01-01");
		$(".date_hd").datetimepicker("setEndDate", y+1 + "-12-31");
		$('.date_hd').datetimepicker('update', dd);
		setDailyMe(common.GetDateStr(0));
		$('[original-title]').tipsy({fade: true, gravity: 'n'});
		$(".dropdown-toggle").on("click",function(e){
			e.preventDefault();
			if($(".dropdown_ssw").css("display") == "none"){
				var top = $(".dropdown-toggle").offset().top + 34;
				var left = $(".dropdown-toggle").offset().left;
				$(".dropdown_ssw").css("top",top);
				$(".dropdown_ssw").css("left",left);
				$(".dropdown_ssw").show();
			}else{
				$(".dropdown_ssw").hide();
			}		
		});
		/*$(".dropdown-toggle").on("blur",function(e){
			$(".dropdown_ssw").hide();
		});*/
		$(".dropdown_ssw a").on("click",function(e){
			e.preventDefault();
			$(".dropdown-toggle span").html($(this).html());
			$(".dropdown_ssw").hide();
			$("._tt_side_subnav .active").removeClass("active");
			$("._tt_side_subnav li:eq(0)").addClass("active");
			var y = $(this).html();
			var date = y +"-01-01";
			var dd = new Date(date.replace(/-/g, "/"));
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "1":
					setDailyMe(date);
					break;
				case "2":
					setDailyTeam(date);
			}
			$('.date_hd').datetimepicker('update', dd);
		});
		$("._tt_side_subnav li").on("click",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$("._tt_side_subnav .active").removeClass("active");
			$(this).addClass("active");
			var y = $(".dropdown-toggle span").html();
			var m = $(this).find("a").html();
			m = m.substring(0,m.length-1);
			var date = common.FormatDate(y +"/"+m+"/1");
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "1":
					setDailyMe(date);
					break;
				case "2":
					setDailyTeam(date);
			}
			var dd = new Date(date.replace(/-/g, "/"));
			$('.date_hd').datetimepicker('update', dd);
		});
		$(".tab_tp li").on("click",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$(".tab_tp li.active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-type");
			$('.date_hd').datetimepicker('update', dd);
			switch(type){
				case "1":
					setDailyMe(common.GetDateStr(0));
					break;
				case "2":
					setDailyTeam(common.GetDateStr(0));
			}
		});
		//添加日报
		$(document).on("input",".tt_daily_pub_view textarea",function(e){
			e.preventDefault();
			var dContent = $(this).val();
			$(".tt_daily_pub_view .num_pm").html(dContent.length);
			if(dContent){
				$(".tt_daily_pub_view .btn-sure").removeClass("btn-disabled");
			}else{
				$(".tt_daily_pub_view .btn-sure").addClass("btn-disabled");
			}
		})
		$(document).on("click",".tt_daily_pub_view .btn-sure",function(e){
			e.preventDefault();
			var dContent = $(".tt_daily_pub_view textarea").val();
			if(!dContent){
				layer.msg('请输入日报内容！',{time:2000});
				return;
			}
			var isShare = $("input[name=share]").is(':checked')? 1:0;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				isShare: isShare,
				dailyJson: JSON.stringify({
					teamId: userData.teamId,
					uId: userData.uId,
					dContent: dContent
				})
			}
			$.post("/DailyPaperManage.aspx?method=AddDailyPaper", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						setDailyMe(common.GetDateStr(0));
						break;
				}
			});
		});
		$(document).on("click",".edit-pub-daily-btn",function(e){
			e.preventDefault();
			$(".dynamic_fed").hide();
			$(".update_input_pm").slideDown(500);
		});
		$(document).on("click",".update_daily_sure",function(e){
			e.preventDefault();
			var dContent = $(".update_input_pm textarea").val();
			if(!dContent){
				layer.msg('请输入日报内容！',{time:2000});
				return;
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				dailyJson: JSON.stringify({
					dId: daily.dId,
					teamId: userData.teamId,
					uId: userData.uId,
					dContent: dContent,
					readLev: daily.readLev,
					createDate: daily.createDate
				})
			}
			$.post("/DailyPaperManage.aspx?method=EditDailyPaper", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						setDailyMe(common.FormatDate(daily.createDate));
						break;
				}
			});
		});
		$(document).on("click",".update_daily_white",function(e){
			e.preventDefault();
			$(".dynamic_fed").show();
			$(".update_input_pm").hide();
		});
	}
	function setDailyDate(d){ //设置当前日期
		var vYear = d.getFullYear();
		var vMon = d.getMonth() + 1;
		var vDay = d.getDate();
		var vWeek = common.days[d.getDay()];
		var type = $(".tab_tp li.active").attr("data-type");
		switch(type){
			case "1":
				$(".tt_daily_completion .title_dc").html("我的日报 "+vYear+"年"+vMon+"月"+vDay+"日（"+vWeek+"）");
				break;
			case "2":
				$(".tt_daily_completion .title_dc").html("团队日报 "+vYear+"年"+vMon+"月"+vDay+"日（"+vWeek+"）");
		}
		$(".input_pm textarea").attr("placeholder",vYear+"年"+vMon+"月"+vDay+"日日报");//设置新增编辑框日期
	}
	function setDailyMe(date){//获取某天日报 date格式：2015-01-01
		var vMon = parseInt(date.substring(5,7)) - 1;
		$("._tt_side_subnav .active").removeClass("active");
		$("._tt_side_subnav li:eq("+ vMon +")").addClass("active");
		var dData = {
			uid: userData.uId,
			teamid: userData.teamId,
			token: localStorage.token,
			date: date
		}
		$.post("/DailyPaperManage.aspx?method=GetUserDailyPaper",dData).then(function(result){
			var d = JSON.parse(result);
			if(d.Result != "0"){
				daily = d.ResultString;
				var status,sclass = "";
				var isToday = (date == common.GetDateStr(0)? 1:0);
				if(daily){
					daily = daily.dataList[0];
					var createDate = new Date(daily.createDate.substring(0,10));
					var todayDate = new Date(date);
					//status = createDate-todayDate? "逾期提交": "按时提交";
					//sclass = createDate-todayDate? "icon-right-delay": "icon-right";
					status = "按时提交";
					sclass = "icon-right";
				}				
				var data = {
					daily: daily,
					status: status,
					sclass: sclass,
					date: date,
					isToday: isToday
				};
				var render = _.template($("#daily_aboutme").html());
				var html = render(data);
				$(".tt_page_container").html(html);
				var dd = new Date(date.replace(/-/g, "/"));
				setDailyDate(dd);
			}
		});
	}
	function setDailyTeam(date){//获取团队某天日报
		var vMon = parseInt(date.substring(5,7)) - 1;
		$("._tt_side_subnav .active").removeClass("active");
		$("._tt_side_subnav li:eq("+ vMon +")").addClass("active");
		var dData = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token,
			date: date
		}
		var tData = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token
		}
		$.when($.post("/DailyPaperManage.aspx?method=GetTeamDailyPaper", dData),$.post("/UserManage.aspx?method=UserList",tData)).then(function(result1,result2){
			if(result1[1] != "success" || result2[1] != "success") return;
			var d1 = JSON.parse(result1[0]);
			var d2 = JSON.parse(result2[0]);
			if(d1.Result != "0" && d2.Result == "1"){
				var daily = d1.ResultString;
				if(daily){
					daily = daily.dataList;
				}				
				var data = {
					daily: daily,
					userlist: JSON.parse(d2.ResultString)
				};
				var render = _.template($("#daily_aboutteam").html());
				var html = render(data);
				$(".tt_page_container").html(html);
				var dd = new Date(date.replace(/-/g, "/"));
				setDailyDate(dd);
			}
		});
		/*$.post("/DailyPaperManage.aspx?method=GetTeamDailyPaper",dData).then(function(result){
			var d = JSON.parse(result);
			if(d.Result != "0"){
				var daily = d.ResultString;
				if(daily){
					daily = daily.dataList;
				}				
				var data = {
					daily: daily
				};
				var render = _.template($("#daily_aboutteam").html());
				var html = render(data);
				$(".tt_page_container").html(html);
				var dd = new Date(date);
				setDailyDate(dd);
			}
		});*/
	}
});