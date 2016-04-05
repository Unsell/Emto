require.config({
    paths: {
        jquery: "jquery-2.1.4.min",
        tipsy: "jquery.tipsy",
        datetimepicker: "bootstrap-datetimepicker.min",
        underscore: "underscore-min",
        layer: "layer/layer"
    },
    urlArgs: "v=3",//设置版本号
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
	function callback(){
		layer.config({
		    path: '../public/js/layer/',
		    extend: 'extend/layer.ext.js'
		});
		$('[original-title]').tipsy({fade: true, gravity: 'n'});
		//初始化头部内容
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		common.logout();
		setHomeMeFeed();
		$(document).on("click",function(e){
			e = window.event || e; // 兼容IE7
			obj = $(e.srcElement || e.target);
			if (!$(obj).is(".smember_container,.smember_container *,.task-create-principle,.task-create-principle *,.ux_add_btn,.project_add_btn")) {
				$(".smember_container").hide();
			}
		});
		//添加任务 初始化时间
		var d = new Date();
		var startTime = common.FormatDate(d);
		var endTime = common.FormatDate(d);
		$(".task-create-date-inner").attr("data-sdate", startTime);
		$(".task-create-date-inner").attr("data-edate", endTime);
		$(".task-create-date-inner").attr("original-title", "起止时间：" + startTime + "至" + endTime);
		$(".task-create-tools-item-wraper .task-create-applyuser-icon").html("发起人："+userData.nickName);
		$(".task-create-principle-inner .task-create-principle-label").html(userData.nickName + "负责");
		$(".task-create-principle-inner").attr("data-uid",userData.uId);
		$(document).on("click", ".task-create-date-inner", function(e) {
			e.preventDefault();
			var top = $(".task-create-date-inner").offset().top + 35;
			var left = $(".task-create-date-inner").offset().left - 450;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","task-create-date-inner")
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"));
		});
		$(document).on("click", ".range_inputs .cancelBtn", function(e){//时间框取消
			e.preventDefault();
			$(".tt-time-date-picker").hide();
		});
		$(".range_inputs .applyBtn").on("click",function(e){//时间框确认
			e.preventDefault();
			var startTime = $(".startDatetime").attr("data-sdate");
			var endTime = $('.endDatetime').attr("data-edate");
			$(".task-create-date-inner").attr("data-sdate",startTime);
			$(".task-create-date-inner").attr("data-edate",endTime);
			$(".task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
			$(".tt-time-date-picker").hide();
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
					$(".tt_daily_pub_view").hide();
					$(".publish_daily_done").show();
					break;
				case "2":
					break;
			}
		});
		/*$(".has-icon").on("input", function() {
			if ($(".has-icon").val()) {
				$(".task-create-bottom .btn-sure").removeClass("btn-disabled");
			} else {
				$(".task-create-bottom .btn-sure").addClass("btn-disabled");
			}
		});*/
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
		$(document).on("click",".task-create-principle-inner", function(e){
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left - 100;
			$(".smember_container_fzr").css("top", top);
			$(".smember_container_fzr").css("left", left);
			$(".smember_container_fzr").show();
			$(".smember_container_fzr").attr("data-type", "principal_task");
			$(".smember_container_cyr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($(".task-create-class").attr("data-id"));
			var type = parseInt($(".task-create-class").attr("data-type"));
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
							var uid = $(".task-create-principle-inner").attr("data-uid");
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
							var uid = $(".task-create-principle-inner").attr("data-uid");
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
			}
		});
		$(document).on("click", ".ux_add_btn", function(e){
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left;
			$(".smember_container_cyr").css("top", top);
			$(".smember_container_cyr").css("left", left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type", "participant_task");
			$(".smember_container_fzr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($(".task-create-class").attr("data-id"));
			var type = parseInt($(".task-create-class").attr("data-type"));
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
							var uid = $(".participant_taskuser_result").attr("data-uid");
							uid && (uid = JSON.parse(uid));
							uid || (uid = []);
							$.each(userlist.dataList, function(index, item) {
								//if(item.uId == userData.uId) return;
								if($.inArray(item.uId,userIds) != -1) return;
								userIds.push(item.uId);
								searchUserlist.push(item);
								if(item.uId == parseInt($(".task-create-principle-inner").attr("data-uid"))) return;
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
							var uid = $(".participant_taskuser_result").attr("data-uid");
							uid && (uid = JSON.parse(uid));
							uid || (uid = []);
							$.each(userlist, function(index, item) {
								//if(item.uId == userData.uId) return;
								if(item.uId == parseInt($(".task-create-principle-inner").attr("data-uid"))) return;
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
					if(item.uId == parseInt($(".task-create-principle-inner").attr("data-uid"))) return;
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
					if(item.uId == parseInt($(".task-create-principle-inner").attr("data-uid"))) return;
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
			}
		})
		$(document).on("click", ".smember_btn_default", function(e){//添加负责人参与人确认
			e.preventDefault();
			$(".smember_container").hide();
			
		});
		$(document).on("click", ".task-create-bottom .btn-sure", function(e){ //添加任务 确认
			e.preventDefault();
			if($(this).hasClass("btn-disabled")) return;
			var tName = $(".ns-task-create-name .has-icon").val();
			var tDescribe = $(".redactor_content").val();
			var principal_uid = $(".task-create-principle-inner").attr("data-uid");//负责人id
			var tStartDate = $(".task-create-date-inner").attr("data-sdate");
			var tEndDate = $(".task-create-date-inner").attr("data-edate");
			var tProproty = $(".task-create-tools-item .priority").val();
			var ftId = $(".task-create-class").attr("data-id");
			var ftType = $(".task-create-class").attr("data-type");
			if(!tName){
				layer.msg('请输入任务名称！',{time:2000});
				return;
			}
			if(!principal_uid){
				layer.msg('请选择任务负责人！',{time:2000});
				return;
			}
			var userjson = [{teamId:userData.teamId,tId:0,uId:userData.uId,uRole:1}];
			principal_uid && userjson.push({teamId:userData.teamId,tId:0,uId:principal_uid,uRole:0});//负责人
			var participant_uid = $(".participant_taskuser_result").attr("data-uid");
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
						var type = $(".nav_tabs li.active").attr("data-name");
						switch(type){
							case "aboutme-all":
								setHomeMeFeed();
								break;
							case "aboutteam-all":
								setHomeTeamFeed();
								break;
						}
						break;
					case "2":
						alert(d.Tip);
						break;
				}
			});
		});
		/*$(".task-create-principle").on("click",function(e){
			e.preventDefault();
			var top = $(".task-create-principle").offset().top + 44;
			var left = $(".task-create-principle").offset().left;
			$(".smember_container").css("top",top);
			$(".smember_container").css("left",left);
			$(".smember_container").show();
		});
		$(".smember_btn_default").on("click",function(){
			$(".smember_container").hide();
		});*/
		$(".has-icon").on("input", function() {
			if ($(".has-icon").val()) {
				$(".pubtask_home .btn-sure").removeClass("btn-disabled");
			} else {
				$(".pubtask_home .btn-sure").addClass("btn-disabled");
			}
		});
		$(".task-create-participator").on("click",function(e){
			e.preventDefault();
			if($(".task-create-layout-extend").css("display") == "none"){
				$(".task-create-layout-extend").show();
			}else{
				$(".task-create-layout-extend").hide();
				$(".smember_container").hide();
			}		
		});
		/*$(".ux_add_btn").on("click",function(e){
			e.preventDefault();
			//if($(".smember_container") == "none") TODO
			var top = $(".ux_add_btn").offset().top + 44;
			var left = $(".ux_add_btn").offset().left;
			$(".smember_container").css("top",top);
			$(".smember_container").css("left",left);
			$(".smember_container").show();
		});*/
		//添加任务 end
		//添加动态
		dynamicImg = "";
		$(document).on("input",".addDynamic-writing",function(e){
			e.preventDefault();
			var value = $(".addDynamic-writing").val();
			$(".pubblog_home .num_pm").html(value.length);
			if(value.length <= 100){
				$(".tt_publishmblog .btn-sure").removeClass("btn-disabled");
			}else{
				$(".tt_publishmblog .btn-sure").addClass("btn-disabled");
			}
		});
		$(".upload_file_input").on("change",function(e){
			e.preventDefault();
			var formData = new FormData();
			formData.append("teamId", userData.teamId);
			formData.append("uid", userData.uId);
			formData.append("token", localStorage.token);
			var num = $(".upload_file_input")[0].files.length;
			for(var i=0;i<num;i++){
				formData.append("file",$(".upload_file_input")[0].files[i]);
			}
			$.ajax({
				url: "/DynamicManage.aspx?method=UpLoadDynamicImage", //server script to process data
				type: 'POST',
				// Form数据
				data: formData,
				//Options to tell JQuery not to process data or worry about content-type
				cache: false,
				//async:false,
				contentType: false,
				processData: false,
				/*xhr: xhr_provider,*/ //提交请求的响应回调
				success: function(result) {
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							layer.msg('上传图片成功！',{time:2000});
							dynamicImg = d.ResultString;
							break;
					}
				}
			});
		});
		$(document).on("click",".pubblog_home .btn-sure",function(e){
			e.preventDefault();
			var writing = $(".addDynamic-writing").val();
			if(!writing){
				layer.msg('请输入动态内容！',{time:2000});
				return;
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				dynamicJson: JSON.stringify({
					teamId: userData.teamId,
					uId: userData.uId,
					shareType: "自定义",
					relationId: "",
					writing: writing,
					photo: dynamicImg,
					address: ""
				})
			};
			$.post("/DynamicManage.aspx?method=AddDynamic",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						$(".addDynamic-writing").val("");
						$(".tt_publishmblog .btn-sure").addClass("btn-disabled");
						$(".upload_file_input").val("");
						$(".pubblog_home .num_pm").html("0");
						dynamicImg = "";
						var type = $(".nav_tabs li.active").attr("data-name");
						switch(type){
							case "aboutme-all":
								setHomeMeFeed();
								break;
							case "aboutteam-all":
								setHomeTeamFeed();
								break;
						}
						break;
				}
			});
		})
		$(document).on("click",".tt_pubtab li",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$(".tt_pubtab .active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-type");
			switch(type){
				case "pub-blog":
					$("[data-name=pub-blog]").show();
					$("[data-name=pub-task]").hide();
					$("[data-name=pub-daily]").hide();
					break;
				case "pub-task":
					$("[data-name=pub-blog]").hide();
					$("[data-name=pub-task]").show();
					$("[data-name=pub-daily]").hide();
					break;
				case "pub-daily":
					$("[data-name=pub-blog]").hide();
					$("[data-name=pub-task]").hide();
					$("[data-name=pub-daily]").show();
					break;
			}
		});
		$(document).on("click",".nav_tabs li",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$(".nav_tabs .active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-name");
			switch(type){
				case "aboutme-all":
					setHomeMeFeed();
					break;
				case "aboutteam-all":
					setHomeTeamFeed();
					break;
			}
		});
		//回复动态
		$(document).on("click",".feed-action-reply",function(e){
			e.preventDefault();
			var sid = $(this).attr("data-sid");
			$("#"+sid).show();
		});
		$(document).on("input",".feed-new-content",function(e){ //监听输入内容
			var sid = $(this).attr("data-sid");
			if($(this).val()){
				$(".btn-sure[data-sid="+sid+"]").removeClass("btn-disabled");
			}else{
				$(".btn-sure[data-sid="+sid+"]").addClass("btn-disabled");
			}
		})
		$(document).on("click",".tt_publishmblog .cancel_pm",function(e){ //取消动态评论
			e.preventDefault();
			var sid = $(this).attr("data-sid");
			$("#"+sid).hide();
		});
		$(document).on("click",".tt_publishmblog .btn-sure",function(e){
			e.preventDefault();
			if($(this).hasClass("btn-disabled")) return;
			var sid = $(this).attr("data-sid");
			var scContent = $(".feed-new-content[data-sid="+sid+"]").val();
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				ShareCommentsJson: JSON.stringify({
					teamId: userData.teamId,
					sId: sid,
					uId: userData.uId,
					scContent: scContent
				})
			}
			$.post("/DynamicManage.aspx?method=ReplyDynamic",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						if($(".nav_tabs li.active").attr("data-name") == "aboutme-all"){
							setHomeMeFeed();
						}else{
							setHomeTeamFeed()
						}
						break;
				}
			})
		});
		//回复动态 end
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
		});
		$(document).on("click",".tt_daily_pub_view .btn-sure",function(e){
			e.preventDefault();
			var isShare = $("input[name=share]").is(':checked')? 1:0;
			var dContent = $(".tt_daily_pub_view textarea").val();
			if(!dContent){
				layer.msg('请输入日报内容！',{time:2000});
				return;
			}
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
						$(".tt_daily_pub_view").hide();
						$(".publish_daily_done").show();
						var type = $(".nav_tabs li.active").attr("data-name");
						switch(type){
							case "aboutme-all":
								setHomeMeFeed();
								break;
							case "aboutteam-all":
								setHomeTeamFeed();
								break;
						}						
						break;
				}
			});
		});		
	}
	function setHomeMeFeed(){
		var data = {
			token: localStorage.token,
			uid: userData.uId,
			teamId: userData.teamId,
			colleagueId: userData.uId
		};
		$.post("/DynamicManage.aspx?method=GetDynamicByUid", data).then(function(result) {
			var d = JSON.parse(result);
			if(!d.ResultString) return;
			var feedlist = JSON.parse(d.ResultString);
			feedlist || (feedlist = []);
			var feeddata = {
				feedlist: feedlist
			};
			var render = _.template($("#home_feed").html());
			var html = render(feeddata);
			$(".home-feed-list").html(html);
			layer.photos({
		        photos: '.attachment_fb'
		    });
		});
	}
	function setHomeTeamFeed(){
		var data = {
			token: localStorage.token,
			uid: userData.uId,
			teamId: userData.teamId
		};
		$.post("/DynamicManage.aspx?method=DynamicListByTeam", data).then(function(result) {
			var d = JSON.parse(result);
			if(!d.ResultString) return;
			var feedlist = JSON.parse(d.ResultString);
			feedlist || (feedlist = []);
			var feeddata = {
				feedlist: feedlist
			};
			var render = _.template($("#home_feed").html());
			var html = render(feeddata);
			$(".home-feed-list").html(html);
			layer.photos({
		        photos: '.attachment_fb'
		    });
		});
	}
});