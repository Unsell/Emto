require.config({
    paths: {
        jquery: "jquery-2.1.4.min",
        tipsy: "jquery.tipsy",
        datetimepicker: "bootstrap-datetimepicker.min",
        underscore: "underscore-min",
        layer: "layer/layer"
    },
    urlArgs: "v=12",//设置版本号
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
		$('[original-title]').tipsy({
			fade: true,
			gravity: 'n'
		});
		if(userData.rLevel != "0"){
			$(".tt_enter_tms").show();
		}
		//初始化头部内容
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		common.logout();
		$(document).on("click",function(e){
			e = window.event || e; // 兼容IE7
			obj = $(e.srcElement || e.target);
			if (!$(obj).is(".smember_container,.smember_container *,.task-create-principle,.task-create-principle *,.ux_add_btn,.project_add_btn,.taskdetail-add-partner")) {
				$(".smember_container").hide();
			}
			if (!$(obj).is(".tt_changestatusview,.tt_changestatusview *,.plandetail_status,.plandetail_status *")) {
				$(".tt_changestatusview").hide();
			}
		});
		//添加任务 初始化时间
		var d = new Date();
		//选中是周几
		var weekArray = [];
		for (i = 0; i < 7; i++) {
			weekArray[i] = common.GetDateStr(parseInt(i) - parseInt(d.getDay()) + 1);
		}
		$(".right_week li").each(function(i) {
			$(this).attr("data-date", weekArray[i]);
		});
		$(".right_week li:eq(" + (d.getDay() - 1) + ")").addClass("active");
		$(".right_week li:eq(" + (d.getDay() - 1) + ") a").html("今天");
		//选中是周几 end
		$("#datetimepicker").datetimepicker({
			language: 'zh',
			format: 'yyyy-mm-dd',
			autoclose: true,
			minView: "month"
		})
		.on("changeDate",function(e){
			var datetime = $(".ywm_datetimepicker").val();
			var dateweek = new Date(datetime);
			$(".right_week .active").removeClass("active")
			if($.inArray(datetime,weekArray) != -1){//选中的日期不属于本周
				$(".right_week li:eq(" + (dateweek.getDay()-1) + ")").addClass("active");
			}
			common.setDateTime(dateweek);
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "my":
					getTaskByme(datetime);
					break;
				case "group":
					getTaskByTeam(datetime);
					break;
			}
		});
		common.setDateTime(d);
		var startTime = common.FormatDate(d);
		var endTime = common.FormatDate(d);
		$(".task-create-date-inner").attr("data-sdate", startTime);
		$(".task-create-date-inner").attr("data-edate", endTime);
		$(".task-create-date-inner").attr("original-title", "起止时间：" + startTime + "至" + endTime);
		$(".task-create-tools-item-wraper .task-create-applyuser-icon").html("发起人："+userData.nickName);	
		$(".task-create-principle-inner .task-create-principle-label").html(userData.nickName + "负责");
		$(".task-create-principle-inner").attr("data-uid",userData.uId);
		$(".btn_tths").on("click", function(e) {
			e.preventDefault();
			$(".tt_headsearch").addClass("focus_tt_headsearch");
			$(".text_tths").show();
		});
		$(".text_tths input").on("blur", function(e) {
			e.preventDefault();
			$(".tt_headsearch").removeClass("focus_tt_headsearch");
			$(".text_tths").hide();
		});
		//选择参与人
		/*$(".task-create-principle").on("click",function(e){
			e.preventDefault();
			var top = $(".task-create-principle").offset().top + 44;
			var left = $(".task-create-principle").offset().left;
			$(".smember_container").css("top",top);
			$(".smember_container").css("left",left);
			$(".smember_container").show();
		});*/
		$(".tt_bench_myplan .has-icon").on("input", function() {
			if ($(this).val()) {
				$(".tt_bench_myplan .btn-sure").removeClass("btn-disabled");
			} else {
				$(".tt_bench_myplan .btn-sure").addClass("btn-disabled");
			}
		});
		//$(document).on("click","")
		$(".task-create-participator").on("click", function(e) {
			e.preventDefault();
			if ($(".task-create-layout-extend").css("display") == "none") {
				$(".task-create-layout-extend").show();
			} else {
				$(".task-create-layout-extend").hide();
				$(".smember_container").hide();
			}
		});
		//起止时间
		$(document).on("click", "._tt_layout_home_container .task-create-date-inner", function(e) {
			e.preventDefault();
			var top = $(".task-create-date-inner").offset().top + 35;
			var left = $(".task-create-date-inner").offset().left - 450;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","task-create-date-inner");
			var type = parseInt($(".task-create-class").attr("data-type"));
			if(type == 2)
				common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"));
			else{
				var lsdate = $(".task-create-class").attr("data-sdate");
				var ledate = $(".task-create-class").attr("data-edate");
				common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"),lsdate,ledate);
			}
				
		});
		$(document).on("click", ".range_inputs .cancelBtn", function(e){//时间框取消
			e.preventDefault();
			$(".tt-time-date-picker").hide();
		});
		$(document).on("click", ".range_inputs .applyBtn", function(e){//时间框确认
			e.preventDefault();
			var type = $(".tt-time-date-picker").attr("data-type");
			switch(type){
				case "task-create-date-inner":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");
					$(".tt-task-create .task-create-date-inner").attr("data-sdate",startTime);
					$(".tt-task-create .task-create-date-inner").attr("data-edate",endTime);
					$(".tt-task-create .task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
					$(".tt-time-date-picker").hide();
					break;
				case "childtask-create-date-inner":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");
					$(".task-detail-layout .task-create-date-inner").attr("data-sdate",startTime);
					$(".task-detail-layout .task-create-date-inner").attr("data-edate",endTime);
					$(".task-detail-layout .task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
					$(".tt-time-date-picker").hide();
					break;
				case "task-detail-date-inner":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");					
					if(taskdetail.tStartDate == startTime && taskdetail.tEndDate == endTime) return;
					taskdetail.tStartDate = startTime;
					taskdetail.tEndDate = endTime;
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						taskJson: JSON.stringify(taskdetail),
						taskUserJson: JSON.stringify(taskuser)
					}
					$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								//alert("更新成功");
								$(".set-task-date").attr("data-sdate",startTime);
								$(".set-task-date").attr("data-edate",endTime);
								$(".set-task-date").html(startTime+" -- "+endTime);
								var startDate = new Date(startTime);
					            var endDate = new Date(endTime);
					            var todayDate = new Date();
					            var timetype = 1;
					            todayDate = new Date(todayDate.toLocaleDateString());
								if (todayDate > endDate) {
									timetype = 0;
								} else if (todayDate < startDate) {
									var days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
								} else {
									var days = Math.ceil((endDate - todayDate) / (1000 * 60 * 60 * 24));
								}
					            if(timetype){
					            	$(".task-detail-layout .overdue").html("剩余 "+ days + " 天");
					            }else{
					            	$(".task-detail-layout .overdue").html("");
					            }
								$(".tt-time-date-picker").hide();
								break;
						}
					});
					break;	
			}			
		});
		//星期切换
		$(".right_week .week_list").on("click", function() {
			if ($(this).hasClass("active")) return;
			$(".right_week .active").removeClass("active");
			$(this).addClass("active");
			var date = $(this).attr("data-date");
			var d = new Date(date);
			common.setDateTime(d);
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "my":
					getTaskByme(date);
					break;
				case "group":
					getTaskByTeam(date);
					break;
			}			
		});
		
		$(".today_plt").on("click", function() {
			if ($(".tt_bench_plan_list [data-name=plan-list]").css("display") != "none") {
				$(".tt_bench_plan_list [data-name=plan-list]").hide();
				$(".today_plt").attr("original-title", "展开");
				$(".today_plt .icon").removeClass("icon-w-arrow-up-double");
				$(".today_plt .icon").addClass("icon-w-arrow-down-double");
			} else {
				$(".tt_bench_plan_list [data-name=plan-list]").show();
				$(".today_plt").attr("original-title", "收起");
				$(".today_plt .icon").addClass("icon-w-arrow-up-double");
				$(".today_plt .icon").removeClass("icon-w-arrow-down-double");
			}
		});
		//个人与团队工作切换
		$(".tab_tp li").on("click",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$(".tab_tp li.active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-type");
			var datetime = $(".ywm_datetimepicker").val();
			switch(type){
				case "my":
					$(".tt-task-create").show();
					getTaskByme(datetime);
					break;
				case "group":
					$(".tt-task-create").hide();
					getTaskByTeam(datetime);
					break;
			}
		});
		//选择所属项目或任务
		$(".task-create-class").attr("data-id",userData.uId);
		$(".task-create-class").on("click", function() {
			var workdata = {
				teamid: userData.teamId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.when($.post("/ProjectManage.aspx?method=GetMyProject", workdata),$.post("/TaskManage.aspx?method=GetMyTask",workdata)).then(function(result1,result2){
				if(result1[1] != "success" || result2[1] != "success") return;
				var d1 = JSON.parse(result1[0]);
				var d2 = JSON.parse(result2[0]);
				if(d1.Result == "1" && d2.Result == "1"){
					worklist = JSON.parse(d1.ResultString);
					worklist = worklist.dataList;
					tasklist = d2.ResultString.dataList;
					$.each(worklist,function(index,item){
						item.task = [];
						$.each(tasklist,function(taskindex,taskitem){
							if(taskitem.ftId == item.pId){
								item.task.push(taskitem);
							}
						})
					})
					var data = {
						worklist: worklist
					};
					var render = _.template($("#work_dialog").html());
					var html = render(data);
					$(".tt_tree_view").html(html);
					var type = parseInt($(".task-create-class").attr("data-type"));					
					if(type == 0 || type == 1){
						var id = $(".task-create-class").attr("data-id");
						$(".tt_class_dialog .select-item[data-id="+id+"]").addClass("active");
					}
						
				}
			});
			/*var workdata = {
				teamid: userData.teamId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/ProjectManage.aspx?method=GetMyProject", workdata).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1": //
						worklist = JSON.parse(d.ResultString);
						worklist = worklist.dataList;
						$(".project-list").html("");
						$.each(worklist, function(index, item) {
							$(".project-list").append('<li data-id="' + item.pId + '" data-type="0"><span class="icon-work-small"></span><span>' + item.pName + '</span></li>');
						});
						break;
					case "2":
						break;
				}
			});
			var taskdata = {
				teamid: userData.teamId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/TaskManage.aspx?method=GetMyTask", taskdata).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1": //
						tasklist = d.ResultString.dataList;
						$(".task-list").html("");
						$.each(tasklist, function(index, item) {
							$(".task-list").append('<li data-id="' + item.tId + '" data-type="1"><span class="icon-work-small"></span><span>' + item.tName + '</span></li>');
						});
						break;
					case "2":
						break;
				}
			});*/
			$(".tt_class_dialog").show();
		});
		$(document).on("click",".select-icon",function(e){
			e.preventDefault();
			if ($(this).hasClass("icon-minus-square")) {
				$(this).removeClass("icon-minus-square");
				$(this).addClass("icon-plus-square");
				$(this).parent().next().hide();
			} else {
				$(this).addClass("icon-minus-square");
				$(this).removeClass("icon-plus-square");
				$(this).parent().next().show();
			}
		});
		$(document).on("click", ".tt_tree_view .select-item", function(e) {
			e.preventDefault();
			$(".tt_tree_view .select-item.active").removeClass("active");
			$(this).addClass("active");
		});
		$(document).on("click",".tt_tree_view .packup",function(e){
			e.preventDefault();
			if ($(this).hasClass("icon-minus")) {
				$(this).removeClass("icon-minus");
				$(this).addClass("icon-plus");
				$(this).parent().next().hide();
			} else {
				$(this).addClass("icon-minus");
				$(this).removeClass("icon-plus");
				$(this).parent().next().show();
			}
		})
		$(".icon-dialog-closed").on("click", function() { //关闭
			$(".tt_class_dialog").hide();
		});
		$(".tt_class_dialog .reset_rd").on("click", function(e) { //清空选项
			e.preventDefault();
			$(".task-create-class").attr("data-type", "2");
			$(".task-create-class").attr("data-id", userData.uId);
			$(".task-create-class-name").html("项目/任务");
			$(".tt_class_dialog").hide();
		});
		$(".tt_class_dialog .cancel_rd").on("click", function(e) { //取消
			e.preventDefault();
			$(".tt_class_dialog").hide();
		});
		$(".tt_class_dialog .sure_rd").on("click", function(e) { //确定
			e.preventDefault();
			if(!$(".tt_tree_view .select-item").hasClass("active")) return;
			var type = parseInt($(".tt_tree_view .select-item.active").attr("data-type"));
			var id = $(".tt_tree_view .select-item.active").attr("data-id");
			var sdate = $(".tt_tree_view .select-item.active").attr("data-sdate");
			var edate = $(".tt_tree_view .select-item.active").attr("data-edate");
			var name = $(".tt_tree_view .select-item.active span:last").html();
			$(".task-create-class").attr("data-type", type);
			$(".task-create-class").attr("data-id", id);
			$(".task-create-class").attr("data-sdate", sdate);
			$(".task-create-class").attr("data-edate", edate);
			$(".task-create-date-inner").attr("data-sdate", sdate);
			$(".task-create-date-inner").attr("data-edate", edate);
			$(".task-create-date-inner").attr("original-title", "起止时间：" + sdate + "至" + edate);
			if(name.length > 3){
				$(".task-create-class-name").html(name.substring(0,3)+"...");
			}else{
				$(".task-create-class-name").html(name);
			}
			$(".tt_class_dialog").hide();
		});
		//选择所属项目或任务 end
		$(document).on("click", ".tt_bench_myplan .task-create-principle-inner", function(e) { //添加任务负责人
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left - 100;
			$(".smember_container_fzr").css("top", top);
			$(".smember_container_fzr").css("left", left);
			$(".smember_container_fzr").show();
			$(".smember_container_fzr").attr("data-type", "principal_task");
			$(".smember_container_cyr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($(".tt_bench_myplan .task-create-class").attr("data-id"));
			var type = parseInt($(".tt_bench_myplan .task-create-class").attr("data-type"));
			searchUserlist = [];
			if(type != 2){
				var data = {
					uid: userData.uId,
					token: localStorage.token
				}
				type? (data.tId=id):(data.pid=id);
				var postUrl = type? "/TaskManage.aspx?method=GetTaskUser":"/ProjectManage.aspx?method=GetProjectUser";
				$.post(postUrl, data).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userIds = [];
							var userlist = type ? d.ResultString:JSON.parse(d.ResultString);
							$(".smember_list_parent").html("");
							$.each(userlist.dataList, function(index, item) {
								if($.inArray(item.uId,userIds) != -1) return;
								userIds.push(item.uId);
								searchUserlist.push(item);
								//if (item.uId == userData.uId) return true;
								//var partuser = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
								//if(partuser && partuser.indexOf(item.uId) != -1) return;
								var str = '<label><span class="select_user_head">'+item.nickName.substring(0,1)+'</span><input name="principal_user" type="radio" value="' + item.uId + '" data-name="' + item.nickName + '"> ' + item.nickName + ' </label>';
								$(".smember_container_fzr .smember_list_parent").append(str);
							});
							var uid = $(".tt_bench_myplan .task-create-principle-inner").attr("data-uid");
							uid && $("input[value=" + uid + "]").attr("checked", "checked");
							break;
					}
				});
			}else{
				var tData = {
					teamid: userData.teamId,
					uid: userData.uId,
					token: localStorage.token
				}
				$.post("/UserManage.aspx?method=UserList", tData).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userlist = JSON.parse(d.ResultString);
							$(".smember_list_parent").html("");
							$.each(userlist, function(index, item) {
								//if (item.uId == userData.uId) return true;
								//var partuser = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
								//if(partuser && partuser.indexOf(item.uId) != -1) return;
								var str = '<label><span class="select_user_head">'+item.nickName.substring(0,1)+'</span><input name="principal_user" type="radio" value="' + item.uId + '" data-name="' + item.nickName + '"> ' + item.nickName + ' </label>';
								$(".smember_container_fzr .smember_list_parent").append(str);
							});
							var uid = $(".tt_bench_myplan .task-create-principle-inner").attr("data-uid");
							uid && $("input[value=" + uid + "]").attr("checked", "checked");
							searchUserlist = userlist;
							break;
					}
				});
			}			
		});
		$(document).on("input",".smember_container_fzr .smember_condition_input",function(e){ //负责人搜索
			var value = $(this).val();
			//value && (value = value.substring(0,value.length-1));
			var flag = false;
			if(value){
				$(".smember_container_fzr .smember_list_parent").html("");
				$.each(searchUserlist,function(index,item){
					if(item.nickName.indexOf(value) != -1){
						flag = true;
						var str = '<label><span class="select_user_head">'+item.nickName.substring(0,1)+'</span><input name="principal_user" type="radio" value="' + item.uId + '" data-name="' + item.nickName + '"> ' + item.nickName + ' </label>';
						$(".smember_container_fzr .smember_list_parent").append(str);
						return false;
					}
				});
				flag || $(".smember_list_parent").html('<div><div class="smember_list_empty">无该成员！</div></div>');
			}else{
				$(".smember_container_fzr .smember_list_parent").html("");
				$.each(searchUserlist,function(index,item){
					var str = '<label><span class="select_user_head">'+item.nickName.substring(0,1)+'</span><input name="principal_user" type="radio" value="' + item.uId + '" data-name="' + item.nickName + '"> ' + item.nickName + ' </label>';
					$(".smember_container_fzr .smember_list_parent").append(str);
				});
			}
			
		});
		$(document).on("click",".smember_container_fzr .smember_list_parent label",function(e){
			var type = $(".smember_container_fzr").attr("data-type");
			switch (type) {
				case "principal_task": //任务负责人
					var uid = $("[name=principal_user]:checked").val();
					var name = $("[name=principal_user]:checked").attr("data-name");
					uid && $(".task-create-principle-inner").attr("data-uid", uid);
					name && $(".task-create-principle-label").html(name + "负责");
					$(".smember_container").hide();
					break;
				case "principal_childtask"://子任务负责人
					var uid = $("[name=principal_user]:checked").val();
					var name = $("[name=principal_user]:checked").attr("data-name");
					uid && $(".task-detail-layout .task-create-principle-inner").attr("data-uid",uid);
					name && $(".task-detail-layout .task-create-principle-label").html(name+"负责");
					$(".smember_container").hide();
					break;
			}
		});
		$(document).on("click", ".tt_bench_myplan .ux_add_btn", function(e) { //任务参与人
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left;
			$(".smember_container_cyr").css("top", top);
			$(".smember_container_cyr").css("left", left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type", "participant_task");
			$(".smember_container_fzr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($(".tt_bench_myplan .task-create-class").attr("data-id"));
			var type = parseInt($(".tt_bench_myplan .task-create-class").attr("data-type"));
			searchUserlist = [];
			if(type != 2){
				var data = {
					pid: id,
					uid: userData.uId,
					token: localStorage.token
				}
				type? (data.tId=id):(data.pid=id);
				var postUrl = type? "/TaskManage.aspx?method=GetTaskUser":"/ProjectManage.aspx?method=GetProjectUser";
				$.post(postUrl, data).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userIds = [];
							var userlist = type ? d.ResultString:JSON.parse(d.ResultString);
							$(".smember_container_cyr .smember_list_parent").html("");
							var uid = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
							uid && (uid = JSON.parse(uid));
							uid || (uid = []);
							$.each(userlist.dataList, function(index, item) {
								//if(item.uId == userData.uId) return;
								if($.inArray(item.uId,userIds) != -1) return;
								userIds.push(item.uId);
								searchUserlist.push(item);
								if(item.uId == parseInt($(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"))) return;
								var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
								if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
									$(".smember_search_content_right .smember_list_parent").append(str);
								}else{
									$(".smember_search_content_left .smember_list_parent").append(str);
								}
							});
							break;
					}
				});
			}else{
				var tData = {
					teamid: userData.teamId,
					uid: userData.uId,
					token: localStorage.token
				}
				$.post("/UserManage.aspx?method=UserList", tData).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userlist = JSON.parse(d.ResultString);
							$(".smember_container_cyr .smember_list_parent").html("");
							var uid = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
							uid && (uid = JSON.parse(uid));
							uid || (uid = []);
							$.each(userlist, function(index, item) {
								//if(item.uId == userData.uId) return;
								if(item.uId == parseInt($(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"))) return;
								var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
								if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
									$(".smember_search_content_right .smember_list_parent").append(str);
								}else{
									$(".smember_search_content_left .smember_list_parent").append(str);
								}
							});
							searchUserlist = userlist;
							break;
					}
				});
			}
		});
		$(document).on("input",".smember_container_cyr .smember_condition_input",function(e){ //参与人搜索
			var value = $(this).val();
			//value && (value = value.substring(0,value.length-1));
			var flag = false;
			var uid = [];
			$.each($(".smember_search_content_right input[name=participant_user]"), function(index, item) {
				uid.push($(this).val());
			});
			if(value){
				$(".smember_search_content_left .smember_list_parent").html("");
				$.each(searchUserlist,function(index,item){
					if(item.uId == parseInt($(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"))) return;
					if($.inArray(item.uId.toString(),uid) != -1) return;
					if(item.nickName.indexOf(value) != -1){
						flag = true;
						var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
						$(".smember_search_content_left .smember_list_parent").append(str);
						return;
					}
				});
				flag || $(".smember_search_content_left .smember_list_parent").html('<div><div class="smember_list_empty">无该成员！</div></div>');
			}else{
				$(".smember_container_cyr .smember_list_parent").html("");
				$.each(searchUserlist, function(index, item) {
					//if(item.uId == userData.uId) return;
					if(item.uId == parseInt($(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"))) return;
					var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
					if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
						$(".smember_search_content_right .smember_list_parent").append(str);
					}else{
						$(".smember_search_content_left .smember_list_parent").append(str);
					}
				});
			}
			
		});
		$(document).on("click",".smember_btn_close",function(e){//关闭参与人选择框
			e.preventDefault();
			$(".smember_container_cyr").hide();
		});
		$(document).on("click",".smember_search_arrow_icon",function(e){ //向右
			e.preventDefault();
			$.each($(".smember_search_content_left [name=participant_user]:checked"), function(index, item) {
				$(item).parent().remove();
				var name = $(this).attr("data-name");
				var str = '<label><input name="participant_user" type="checkbox" value="' + $(this).val() + '" data-name="' + name + '"> <span class="select_user_head">'+name.substring(0,1)+'</span>' + name + ' </label>';
				$(".smember_search_content_right .smember_list_parent").append(str);
			});
		});
		$(document).on("click",".smember_search_arrow_icon_left",function(e){ //向左
			e.preventDefault();
			$.each($(".smember_search_content_right [name=participant_user]:checked"), function(index, item) {
				$(item).parent().remove();
				var name = $(this).attr("data-name");
				var str = '<label><input name="participant_user" type="checkbox" value="' + $(this).val() + '" data-name="' + name + '"> <span class="select_user_head">'+name.substring(0,1)+'</span>' + name + ' </label>';
				$(".smember_search_content_left .smember_list_parent").append(str);
			});
		});
		$(document).on("dblclick",".smember_search_content_left .smember_list_parent label",function(e){
			e.preventDefault();
			$(this).remove();
			var name = $(this).find("input").attr("data-name");
			var id = $(this).find("input").val();
			var str = '<label><input name="participant_user" type="checkbox" value="' + id + '" data-name="' + name + '"> <span class="select_user_head">'+name.substring(0,1)+'</span>' + name + ' </label>';
			$(".smember_search_content_right .smember_list_parent").append(str);
		});
		$(document).on("dblclick",".smember_search_content_right .smember_list_parent label",function(e){
			e.preventDefault();
			$(this).remove();
			var name = $(this).find("input").attr("data-name");
			var id = $(this).find("input").val();
			var str = '<label><input name="participant_user" type="checkbox" value="' + id + '" data-name="' + name + '"> <span class="select_user_head">'+name.substring(0,1)+'</span>' + name + ' </label>';
			$(".smember_search_content_left .smember_list_parent").append(str);
		});
		$(document).on("click",".smember_btn_blue",function(e){ //参与人确认
			e.preventDefault();
			var type = $(".smember_container_cyr").attr("data-type");
			switch (type) {
				case "participant_task": //任务参与人
					var uid = [];
					var name = "";
					$.each($(".smember_search_content_right input[name=participant_user]"), function(index, item) {
						uid.push($(this).val());
						name += $(this).attr("data-name") + "、";
					});
					name = name.substring(0, name.length - 1);
					uid && $(".participant_taskuser_result").attr("data-uid", JSON.stringify(uid));
					$(".participant_taskuser_result").html(name);
					$(".smember_container_cyr").hide();
					break;
				case "participant_childtask"://子任务参与人
					var uid = [];
					var name = "";
					$.each($(".smember_search_content_right input[name=participant_user]"), function(index, item) {
						uid.push($(this).val());
						name += $(this).attr("data-name") + "、";
					});
					name = name.substring(0,name.length-1);
					uid && $(".task-detail-layout .participant_taskuser_result").attr("data-uid",JSON.stringify(uid));
					$(".task-detail-layout .participant_taskuser_result").html(name);
					$(".smember_container_cyr").hide();
					break;
				case "task_add_user"://添加任务成员 TODO
					$(".smember_container_cyr").hide();
					var userArray = [];
					var name = "";
					$.each(taskuser,function(index,item){
						if(item.uRole == 0 || item.uRole == 1){
							userArray.push(item)
						}
					});
					$.each($(".smember_search_content_right input[name=participant_user]"),function(index,item){
						var uid = $(this).val();
						userArray.push({teamId:userData.teamId,tId:taskdetail.tId,uId:uid,uRole:2});//参与人
						name += $(this).attr("data-name") + "、";
					});
					console.log(userArray);
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						taskJson: JSON.stringify(taskdetail),
						taskUserJson: JSON.stringify(userArray)
					}		
					$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								//alert("更新成功");
								name = name.substring(0,name.length-1)
								$(".cyuser-result").html(name);
								taskuser = userArray;
								break;
						}
					});
					break;				
			}
		})
		$(document).on("click", ".smember_btn_default", function(e) { //添加负责人参与人关闭
			e.preventDefault();
			$(".smember_container").hide();
			/*var type = $(".smember_container").attr("data-type");
			switch (type) {
				case "principal_task": //任务负责人
					var uid = $("[name=principal_user]:checked").val();
					var name = $("[name=principal_user]:checked").attr("data-name");
					uid && $(".task-create-principle-inner").attr("data-uid", uid);
					name && $(".task-create-principle-label").html(name + "负责");
					$(".smember_container").hide();
					break;
				case "participant_task": //任务参与人
					var uid = [];
					var name = "";
					$.each($("[name=participant_user]:checked"), function(index, item) {
						uid.push($(this).val());
						name += $(this).attr("data-name") + "、";
					});
					name = name.substring(0, name.length - 1);
					uid && $(".participant_taskuser_result").attr("data-uid", JSON.stringify(uid));
					$(".participant_taskuser_result").html(name);
					$(".smember_container").hide();
					break;
				case "principal_childtask"://子任务负责人
					var uid = $("[name=principal_user]:checked").val();
					var name = $("[name=principal_user]:checked").attr("data-name");
					uid && $(".task-detail-layout .task-create-principle-inner").attr("data-uid",uid);
					name && $(".task-detail-layout .task-create-principle-label").html(name+"负责");
					$(".smember_container").hide();
					break;
				case "participant_childtask"://子任务参与人
					var uid = [];
					var name = "";
					$.each($("[name=participant_user]:checked"),function(index,item){
						uid.push($(this).val());
						name += $(this).attr("data-name") + "、";
					});
					name = name.substring(0,name.length-1);
					uid && $(".task-detail-layout .participant_taskuser_result").attr("data-uid",JSON.stringify(uid));
					$(".task-detail-layout .participant_taskuser_result").html(name);
					$(".smember_container").hide();
					break;
				case "task_add_user"://添加任务成员
					$(".smember_container").hide();
					if(!$("[name=participant_user]:checked").val()) return;
					var name = $(".cyuser-result").html();
					name && (name += "、");
					$.each($("[name=participant_user]:checked"),function(index,item){
						var uid = $(this).val();
						taskuser.push({teamId:userData.teamId,tId:taskdetail.tId,uId:uid,uRole:2});//参与人
						name += $(this).attr("data-name") + "、";
					});
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						taskJson: JSON.stringify(taskdetail),
						taskUserJson: JSON.stringify(taskuser)
					}		
					$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								//alert("更新成功");
								name = name.substring(0,name.length-1)
								$(".cyuser-result").html(name);
								break;
						}
					});
					break;
			}*/
		});
		$(document).on("click", ".tt_bench_myplan .task-create-bottom .btn-sure", function(e) { //添加任务 确认
			e.preventDefault();
			if($(this).hasClass("btn-disabled")) return;
			var tName = $(".tt_bench_myplan .ns-task-create-name .has-icon").val();
			var tDescribe = $(".tt_bench_myplan .redactor_content").val();
			var principal_uid = $(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"); //负责人id
			var tStartDate = $(".tt_bench_myplan .task-create-date-inner").attr("data-sdate");
			var tEndDate = $(".tt_bench_myplan .task-create-date-inner").attr("data-edate");
			var tProproty = $(".tt_bench_myplan .task-create-tools-item .priority").val();
			var ftId = $(".tt_bench_myplan .task-create-class").attr("data-id");
			var ftType = $(".tt_bench_myplan .task-create-class").attr("data-type");
			if(!tName){
				layer.msg('请输入任务名称！',{time:2000});
				return;
			}
			if(!principal_uid){
				layer.msg('请选择任务负责人！',{time:2000});
				return;
			}
			var userjson = [{
				teamId: userData.teamId,
				tId: 0,
				uId: userData.uId,
				uRole: 1
			}];
			principal_uid && userjson.push({
				teamId: userData.teamId,
				tId: 0,
				uId: principal_uid,
				uRole: 0
			}); //负责人
			var participant_uid = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
			if (participant_uid) {
				participant_uid = JSON.parse(participant_uid);
				$.each(participant_uid, function(index, item) {
					userjson.push({
						teamId: userData.teamId,
						tId: 0,
						uId: item,
						uRole: 2
					}); //参与人
				});
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify({
					teamId: userData.teamId,
					tName: tName,
					tDescribe: tDescribe,
					tProposer: userData.uId,
					tStartDate: tStartDate,
					tEndDate: tEndDate,
					tProproty: tProproty,
					tSchedule: 0,
					ftId: ftId,
					ftType: ftType
				}),
				taskUserJson: JSON.stringify(userjson)
			}
			$.post("/ProjectManage.aspx?method=AddTaskforProject", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1": //成功
						//location.reload();
						var date = $(".ywm_datetimepicker").val();
						getTaskByme(date);
						break;
					case "2":
						alert(d.Tip);
						break;
				}
			});
		});
		//判断今日是否已写日报
		var dData = {
			uid: userData.uId,
			teamid: userData.teamId,
			token: localStorage.token,
			date: common.GetDateStr(0)
		}
		$.post("/DailyPaperManage.aspx?method=GetUserDailyPaper",dData).then(function(result){
			var d = JSON.parse(result);
			switch(d.Result){
				case "0": 
					break;
				case "1"://
					if(!d.ResultString) return;
					$(".tt_bench_my_daily .icon_d").removeClass("icon-dialog-closed-warn");
					$(".tt_bench_my_daily .icon_d").addClass("icon-right");
					$(".tt_bench_my_daily .status_dc").html("已提交");
					$(".tt_bench_my_daily .btn").html("查看日报");
					break;
				case "2":
					break;
			}
		});
		getTaskByme(common.GetDateStr(0));
		//任务列表相关
		$(document).on("click",".toggle",function(e){ //显示更多任务信息
			if($(".task-create-layout-tools").css("display") == "none"){
				$(".task-create-layout-tools").show();
				$(".task-create-richeditor").show();
				$(".toggle .l").html("收起");
				$(".toggle .r").addClass("icon-arrow-up-double");
			}else{
				$(".task-create-layout-tools").hide();
				$(".task-create-layout-extend").hide();
				$(".task-create-richeditor").hide();
				$(".toggle .l").html("更多信息");
				$(".toggle .r").removeClass("icon-arrow-up-double");
			}
		});
		$(document).on("click",".task-name",function(e){ //进入任务详情页
			e.preventDefault();
			var tid = $(this).attr("data-tid");
			setTaskDetails(tid);
		});
		$(document).on("click",".pull-screen-container .close-pull-screen",function(e){ //关闭任务详情页
			e.preventDefault();			
			$(".pull-screen-container").hide();
			var date = $(".ywm_datetimepicker").val();
			var type = $(".tab_tp li.active").attr("data-type");
			switch(type){
				case "my":
					break;
				case "group":
					getTaskByTeam(date);
					break;
			}
		});
		$(document).on("click",".btnlist_pdtb .plandetail_status",function(e){
			e.preventDefault();
			
		});
		$(document).on("click",".del_bpdtb",function(e){//删除任务
			e.preventDefault();
			$(".tt_plandetailtopbar ._tt_dialog").show();		
		});
		$(document).on("click",".tt_plandetailtopbar .btn-cancel",function(e){//删除任务 取消
			e.preventDefault();
			$(".tt_plandetailtopbar ._tt_dialog").hide();	
		});
		$(document).on("click",".tt_plandetailtopbar .btn-sure",function(e){//删除任务 确定
			e.preventDefault();
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				tId: taskdetail.tId
			}
			$.post("/TaskManage.aspx?method=DeleteTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						$(".tt_plandetailtopbar ._tt_dialog").hide();
						$(".pull-screen-container").hide();
						var date = $(".ywm_datetimepicker").val();
						var type = $(".tab_tp li.active").attr("data-type");
						switch(type){
							case "my":
								break;
							case "group":
								getTaskByTeam(date);
								break;
						}					
						break;
				}
			});
		});
		$(document).on("click",".sup-delete",function(e){//删除子任务
			e.preventDefault();
			var top = $(this).offset().top - $(".tt_planlist").offset().top;
			$(".tt_planlist ._tt_dialog").css("top",top/10);
			$(".tt_planlist ._tt_dialog").show();
			$(".tt_planlist .btn-sure").attr("data-tid",$(this).attr("data-id"));
		});
		$(document).on("click",".tt_planlist .btn-cancel",function(e){//删除子任务 取消
			e.preventDefault();
			$(".tt_planlist ._tt_dialog").hide();	
		});
		$(document).on("click",".tt_planlist .btn-sure",function(e){//删除子任务 确定
			e.preventDefault();
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				tId: $(this).attr("data-tid")
			}
			$.post("/TaskManage.aspx?method=DeleteTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						$(".tt_plandetailtopbar ._tt_dialog").hide();
						$(".pull-screen-container").hide();
						setTaskDetails(taskdetail.tId);					
						break;
				}
			});
		});
		$(document).on("click",".task-detail-layout .plandetail_status",function(e){ //更新任务状态
			e.preventDefault();
			if($(".task-detail-layout .tt_changestatusview").css("display") == "none"){
				$(".task-detail-layout .tt_changestatusview").show();
			}else{
				$(".task-detail-layout .tt_changestatusview").hide();
			}
		});
		$(document).on("click",".task-detail-layout .tt_changestatusview li",function(e){ //更新任务状态 确认
			e.preventDefault();
			$(".task-detail-layout .tt_changestatusview").hide();
			var tStatus = $(this).attr("data-status");
			if(taskdetail.tStatus == tStatus) return;
			taskdetail.tStatus = tStatus;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify(taskdetail),
				taskUserJson: JSON.stringify(taskuser)
			}
			console.log(data);			
			$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						var status = {0:"未开始",1:"进行中",2:"冻结",3:"已完成",4:"归档"};
						var start = $(".task-detail-layout .plandetail_status").attr("data-status");
						$(".task-detail-layout .status_bpdtb").removeClass("tt_actionstatus_"+start);
						$(".task-detail-layout .status_bpdtb").addClass("tt_actionstatus_"+tStatus);
						$(".task-detail-layout .status").removeClass("icon-status-"+start);
						$(".task-detail-layout .status").addClass("icon-status-"+tStatus);
						$(".task-detail-layout .status_value_show").html(status[tStatus]);
						$(".task-detail-layout .plandetail_status").attr("data-status",tStatus);					
						break;
				}
			});
		});
		$(document).on("change",".task-edit .task-title-input",function(e){ //更新任务名称
			e.preventDefault();
			var tName = $(".task-edit .task-title-input").val();
			if(taskdetail.tName == tName) return;
			taskdetail.tName = tName;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify(taskdetail),
				taskUserJson: JSON.stringify(taskuser)
			}
			console.log(taskuser);
			console.log(data);			
			$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						$(".left_ttpl span[data-tid="+taskdetail.tid+"]").html(tName);
						break;
				}
			});
		});
		$(document).on("change",".task-detail-des .task_detail_description_type",function(e){ //更新任务描述
			e.preventDefault();
			var tDescribe = $(".task-detail-des .task_detail_description_type").val();
			if(taskdetail.tDescribe == tDescribe) return;
			taskdetail.tDescribe = tDescribe;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify(taskdetail),
				taskUserJson: JSON.stringify(taskuser)
			}			
			$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						$(".left_ttpl span[data-tid="+taskdetail.tid+"]").html(tName);
						break;
				}
			});
		});
		$(document).on("click", ".task-detail-layout .set-task-date", function(e) { //更新任务起止日期
			e.preventDefault();
			var top = $(this).offset().top + 35;
			var left = $(this).offset().left - 200;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","task-detail-date-inner");
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"));
		});
		$(document).on("click", ".task-detail-layout .taskdetail-add-partner", function(e){ //添加任务成员
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left;
			$(".smember_container_cyr").css("top",top);
			$(".smember_container_cyr").css("left",left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type","task_add_user");
			var type = parseInt($(".pull-screen-container").attr("data-ftType"));
			var id = parseInt($(".pull-screen-container").attr("data-ftId"));
			//TODO
			searchUserlist = [];
			if(type != 2){
				var data = {
					pid: id,
					uid: userData.uId,
					token: localStorage.token
				}
				type? (data.tId=id):(data.pid=id);
				var postUrl = type? "/TaskManage.aspx?method=GetTaskUser":"/ProjectManage.aspx?method=GetProjectUser";
				$.post(postUrl, data).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userIds = [];
							var userlist = type ? d.ResultString:JSON.parse(d.ResultString);
							$(".smember_container_cyr .smember_list_parent").html("");
							var uid = [];
							var fzrid;
							$.each(taskuser,function(index,item){
								if(item.uRole == 2)
									uid.push(parseInt(item.uId));
								else if(item.uRole == 0)
									fzrid = item.uId;
							});
							$.each(userlist.dataList, function(index, item) {
								//if(item.uId == userData.uId) return;
								if($.inArray(item.uId,userIds) != -1) return;
								userIds.push(item.uId);
								searchUserlist.push(item);
								if(item.uId == parseInt(fzrid)) return;
								var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
								if(uid.length != 0 && $.inArray(parseInt(item.uId),uid) != -1){
									$(".smember_search_content_right .smember_list_parent").append(str);
								}else{
									$(".smember_search_content_left .smember_list_parent").append(str);
								}
							});
							break;
					}
				});
			}else{
				var tData = {
					teamid: userData.teamId,
					uid: userData.uId,
					token: localStorage.token
				}
				$.post("/UserManage.aspx?method=UserList", tData).then(function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							var userlist = JSON.parse(d.ResultString);
							$(".smember_container_cyr .smember_list_parent").html("");
							var uid = $(".tt_bench_myplan .participant_taskuser_result").attr("data-uid");
							uid && (uid = JSON.parse(uid));
							uid || (uid = []);
							$.each(userlist, function(index, item) {
								//if(item.uId == userData.uId) return;
								if(item.uId == parseInt($(".tt_bench_myplan .task-create-principle-inner").attr("data-uid"))) return;
								var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
								if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
									$(".smember_search_content_right .smember_list_parent").append(str);
								}else{
									$(".smember_search_content_left .smember_list_parent").append(str);
								}
							});
							searchUserlist = userlist;
							break;
					}
				});
			}
			/*var tData = {
				teamid: userData.teamId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/UserManage.aspx?method=UserList", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var flag = true;
						var userlist = JSON.parse(d.ResultString);
						var userArray = [];
						$(".smember_list_parent").html("");
						$.each(taskuser,function(index,item){
							userArray.push(parseInt(item.uId));								
						});
						$.each(userlist,function(index,item){				
							//if(userArray.indexOf(item.uId) != -1) return;
							var str = '<label><input name="participant_user" type="checkbox" value="'+ item.uId + '" data-name="'+ item.nickName +'"> '+ item.nickName +' </label>';
							$(".smember_list_parent").append(str);
						});				
						break;
				}
			});*/
		});
		$(document).on("click", ".task-detail-layout .task-create-participator", function(e){//子任务添加参与人
			e.preventDefault();
			if($(".task-detail-layout .task-create-layout-extend").css("display") == "none"){
				$(".task-detail-layout .task-create-layout-extend").show();
			}else{
				$(".task-detail-layout .task-create-layout-extend").hide();
				$(".smember_container").hide();
			}
		});
		$(document).on("click", ".task-detail-layout .ux_add_btn", function(e){
			e.preventDefault();
			var top = $(".task-detail-layout .ux_add_btn").offset().top + 44;
			var left = $(".task-detail-layout .ux_add_btn").offset().left;
			$(".smember_container_cyr").css("top",top);
			$(".smember_container_cyr").css("left",left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type","participant_childtask");
			$(".smember_container_fzr").hide();
			var ftId = $(".pull-screen-container").attr("data-tid");
			searchUserlist = [];
			var tData = {
				tId: ftId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/TaskManage.aspx?method=GetTaskUser", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var userIds = [];
						var userlist = d.ResultString;
						$(".smember_container_cyr .smember_list_parent").html("");
						var uid = $(".task-detail-layout .participant_taskuser_result").attr("data-uid");
						uid && (uid = JSON.parse(uid));
						uid || (uid = []);
						/*if(uid.length == 0){
							$(".smember_search_content_right .smember_list_parent").html('<div><div class="smember_list_empty">请从左侧点击选择</div></div>');
						}*/
						$.each(userlist.dataList, function(index, item) {
							//if(item.uId == userData.uId) return;
							if($.inArray(item.uId,userIds) != -1) return;
							userIds.push(item.uId);
							searchUserlist.push(item);
							if(item.uId == parseInt($(".task-detail-layout .task-create-principle-inner").attr("data-uid"))) return;
							var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
							if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
								$(".smember_search_content_right .smember_list_parent").append(str);
							}else{
								$(".smember_search_content_left .smember_list_parent").append(str);
							}
						});
						break;
				}
			});
		});
		$(document).on("click",".task-detail-layout .task-create-principle-inner", function(e){//子任务添加负责人
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left - 100;
			$(".smember_container_fzr").css("top",top);
			$(".smember_container_fzr").css("left",left);
			$(".smember_container_fzr").show();
			$(".smember_container_fzr").attr("data-type","principal_childtask");
			$(".smember_container_cyr").hide();
			var ftId = $(".pull-screen-container").attr("data-tid");
			searchUserlist = [];
			var tData = {
				tId: ftId,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/TaskManage.aspx?method=GetTaskUser", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var userIds = [];
						var userlist = d.ResultString;
						$(".smember_list_parent").html("");
						$.each(userlist.dataList, function(index, item) {
							if($.inArray(item.uId,userIds) != -1) return;
							userIds.push(item.uId);
							searchUserlist.push(item);
							//if (item.uId == userData.uId) return true;
							//var partuser = $(".task-detail-layout .participant_taskuser_result").attr("data-uid");
							//if(partuser && partuser.indexOf(item.uId) != -1) return;
							var str = '<label><span class="select_user_head">'+item.nickName.substring(0,1)+'</span><input name="principal_user" type="radio" value="' + item.uId + '" data-name="' + item.nickName + '"> ' + item.nickName + ' </label>';
							$(".smember_container_fzr .smember_list_parent").append(str);
						});
						var uid = $(".task-detail-layout .task-create-principle-inner").attr("data-uid");
						uid && $("input[value=" + uid + "]").attr("checked", "checked");
						break;
				}
			});
		});
		$(document).on("click", ".task-detail-layout .task-create-date-inner", function(e) {
			e.preventDefault();
			var top = $(this).offset().top + 35;
			var left = $(this).offset().left - 450;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","childtask-create-date-inner");
			var lsdate = $(".task-detail-layout .set-task-date").attr("data-sdate");
			var ledate = $(".task-detail-layout .set-task-date").attr("data-edate");
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"),lsdate,ledate);
		});
		$(document).on("input",".task-detail-layout .has-icon",function(e){
			if ($(this).val()) {
				$(".task-detail-layout .task-create-bottom .btn-sure").removeClass("btn-disabled");
			} else {
				$(".task-detail-layout .task-create-bottom .btn-sure").addClass("btn-disabled");
			}
		});
		$(document).on("click", ".task-detail-layout .task-create-bottom .btn-sure", function(e){ //添加子任务 确认
			e.preventDefault();
			if($(this).hasClass("btn-disabled")) return;
			var tName = $(".task-detail-layout .ns-task-create-name .has-icon").val();
			var tDescribe = $(".task-detail-layout .redactor_content").val();
			var principal_uid = $(".task-detail-layout .task-create-principle-inner").attr("data-uid");//负责人id
			var tStartDate = $(".task-detail-layout .task-create-date-inner").attr("data-sdate");
			var tEndDate = $(".task-detail-layout .task-create-date-inner").attr("data-edate");
			var tProproty = $(".task-detail-layout .task-create-tools-item .priority").val();
			var ftId = $(".pull-screen-container").attr("data-tid");
			var ftType = 1;
			if(!tName){
				layer.msg('请输入子任务名称！',{time:2000});
				return;
			}
			if(!principal_uid){
				layer.msg('请选择子任务负责人！',{time:2000});
				return;
			}
			var userjson = [{teamId:userData.teamId,tId:0,uId:userData.uId,uRole:1}];
			principal_uid && userjson.push({teamId:userData.teamId,tId:0,uId:principal_uid,uRole:0});//负责人
			var participant_uid = $(".task-detail-layout .participant_taskuser_result").attr("data-uid");
			if(participant_uid){
				participant_uid = JSON.parse(participant_uid);
				$.each(participant_uid,function(index,item){
					userjson.push({teamId:userData.teamId,tId:0,uId:item,uRole:2});//参与人
				});
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify({
					teamId: userData.teamId,
					tName: tName,
					tDescribe: tDescribe,
					tProposer: userData.uId,
					tStartDate: tStartDate,
					tEndDate: tEndDate,
					tProproty: tProproty,
					tSchedule: 0,
					ftId: ftId,
					ftType: ftType
				}),
				taskUserJson: JSON.stringify(userjson)
			}
			$.post("/ProjectManage.aspx?method=AddTaskforProject",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://成功
						//location.reload();
						setTaskDetails(ftId);
						
						break;
					case "2":
						alert(d.Tip);
						break;
				}
			});
		});
		$(document).on("change", ".project_task_progress_type", function(e){ //更新任务进度
			e.preventDefault();
			var tSchedule = parseInt($(".project_task_progress_type").val().replace("%",""));
			if(taskdetail.tSchedule == tSchedule) return;
			if(tSchedule > 0 && tSchedule <= 100){
				taskdetail.tSchedule = tSchedule;
				var data = {
					token: localStorage.token,
					uid: userData.uId,
					taskJson: JSON.stringify(taskdetail),
					taskUserJson: JSON.stringify(taskuser)
				}			
				$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							//alert("更新成功");
							$(".project_task_progress_type").val(tSchedule + "%");				
							break;
					}
				});
			}else{
				$(".project_task_progress_type").val(taskdetail.tSchedule + "%");
			}
		});
		$(document).on("change", ".project_task_priority", function(e){ //更新任务优先级
			var tPriority = $(".project_task_priority").val();
			if(taskdetail.tPriority == tPriority) return;
			taskdetail.tPriority = tPriority;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				taskJson: JSON.stringify(taskdetail),
				taskUserJson: JSON.stringify(taskuser)
			}			
			$.post("/TaskManage.aspx?method=EditTask",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");					
						break;
				}
			});
		});
		//任务 end
	}
	//根据时间获取与我相关的任务
	function getTaskByme(date){
		var tData = {
			uid: userData.uId,
			teamid: userData.teamId,
			token: localStorage.token
		}
		$.post("/TaskManage.aspx?method=GetMyTask",tData).then(function(result){
			var d = JSON.parse(result);
			switch(d.Result){
				case "0": 
					break;
				case "1"://
					var tasklist = d.ResultString.dataList;
					var taskdate = [];
					$.each(tasklist,function(index,item){
						var startDate = new Date(item.tStartDate.split(" ")[0]);
			            var endDate = new Date(item.tEndDate.split(" ")[0]);
			            var todayDate = new Date(date.replace(/-/g, "/"));
			            if(todayDate >= startDate && todayDate <= endDate){
			            	taskdate.push(item);
			            }
					})
					var data = {
						tasklist: taskdate
					};
					var render = _.template($("#index_tasklist").html());
					var html = render(data);
					$(".tt_planlist").html(html);
					$('[original-title]').tipsy({
						fade: true,
						gravity: 'n'
					});
					break;
				case "2":
					$(".tt_planlist").html("");
					break;
			}
		});
	}
	function getTaskByTeam(date){
		var tData = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token
		}
		$.post("/TaskManage.aspx?method=GetTaskByTeam",tData).then(function(result){
			var d = JSON.parse(result);
			switch(d.Result){
				case "0": 
					break;
				case "1"://
					var tasklist = d.ResultString.dataList;
					var taskdate = [];
					$.each(tasklist,function(index,item){
						var startDate = new Date(item.tStartDate.split(" ")[0]);
			            var endDate = new Date(item.tEndDate.split(" ")[0]);
			            var todayDate = new Date(date.replace(/-/g, "/"));
			            if(todayDate >= startDate && todayDate <= endDate){
			            	taskdate.push(item);
			            }
					})
					var data = {
						tasklist: taskdate
					};
					var render = _.template($("#index_tasklist").html());
					var html = render(data);
					$(".tt_planlist").html(html);
					$('[original-title]').tipsy({
						fade: true,
						gravity: 'n'
					});
					break;
				case "2":
					$(".tt_planlist").html("");
					break;
			}
		});
	}
	function setTaskDetails(tid){ //任务详情页
		var height = $(window).height();
		var tdata = {
			token: localStorage.token,
			uid: userData.uId,
			tId: tid
		}
		$.when($.post("/TaskManage.aspx?method=GetTaskByDetails", tdata),$.post("/TaskManage.aspx?method=GetTaskUser",tdata),$.post("/TaskManage.aspx?method=GetChildTask",tdata)).then(function(result1,result2,result3){
			if(result1[1] != "success" || result2[1] != "success" || result3[1] != "success") return;
				var d1 = JSON.parse(result1[0]);
				var d2 = JSON.parse(result2[0]);
				var d3 = JSON.parse(result3[0]);
				var task = d1.ResultString;
				var user = d2.ResultString.dataList;
				taskdetail = task[0];
				taskuser = [];
				if(d1.Result == "1" && d2.Result == "1" && d3.Result != "0"){
					taskdata = {
						task: taskdetail,
						user: user,
						childtask: d3.ResultString
					};
					var render = _.template($("#project_onetask").html());
					var html = render(taskdata);
					$(".pull-screen-container").html(html);
					$(".pull-screen-container").attr("data-tid",tid);
					$(".pull-screen-container").attr("data-ftType",taskdetail.ftType);
					$(".pull-screen-container").attr("data-ftId",taskdetail.ftId);
					$(".pull-screen-container").show();
					$(".pull-screen-container").css("height",height);
					$(".task-detail-scroll").css("height",height-60);
					$.each(user,function(index,item){
						taskuser.push({teamId:item.teamId,tId:tid,uId:item.uId,uRole:item.uRole});
					});
					$(".task-create-tools-item-wraper .task-create-applyuser-icon").html("发起人："+userData.nickName);
					$(".pull-screen-container .task-create-principle-label").html(userData.nickName + "负责");
					$(".pull-screen-container .task-create-principle-inner").attr("data-uid",userData.uId);
					var startTime = taskdetail.tStartDate.substring(0,10);
					var endTime = taskdetail.tEndDate.substring(0,10);
					$(".task-detail-layout .task-create-date-inner").attr("data-sdate",startTime);
					$(".task-detail-layout .task-create-date-inner").attr("data-edate",endTime);
					$(".task-detail-layout .task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
					$('[original-title]').tipsy({fade: true, gravity: 'n'});
				}					
		});
	}
});