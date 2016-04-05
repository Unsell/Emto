require.config({
    paths: {
        jquery: "jquery-2.1.4.min",
        tipsy: "jquery.tipsy",
        datetimepicker: "bootstrap-datetimepicker.min",
        underscore: "underscore-min"
    },
    urlArgs: "v=5",//设置版本号
    shim: {
    	"tipsy": {
    		deps: ["jquery"]
    	},
    	"datetimepicker": {
    		deps: ["jquery"]
    	}
    }
});
require(["jquery","common","tipsy","underscore"],function($,common){
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
		//初始化头部内容
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		common.logout();
		var height = $(document).height();
		$("#main-region").css("min-height",height);
		$(".tt_layout_container").css("min-height",height);
		$('[original-title]').tipsy({fade: true, gravity: 'n'});
		getEquipmentList();
		$("._tt_side_subnav li").on("click",function(e){
			e.preventDefault();
			if($(this).hasClass("active")) return;
			$("._tt_side_subnav .active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-type");
			switch(type){
				case "device": 
					$(".project_create").hide();
					$(".project_main_region").show();
					break;
			}
		});
		$(document).on("click", ".project_create_btn", function(e) { //新建设备
			e.preventDefault();
			$(".project_create").show();
			$(".project_main_region").hide();
		});
		$(".project_cancel_btn").on("click", function(e) {
			e.preventDefault();
			$(".project_create").hide();
			$(".project_main_region").show();
		});
		$(".project_create .project_create_btn").on("click", function(e) {
			e.preventDefault();
			$(".project_create").hide();
			$(".project_main_region").show();
			var eName = $(".apply_name_input").val();
			var eDescription = $(".apply_description_input").val();
			var eType  = $(".apply_version_input").val();
			var linkMan = $(".apply_username_input").val();
			var telephone = $(".apply_phone_input").val();
			var email = $(".apply_email_input").val();
			var password = $(".apply_password_input").val();
			var viewId  = $(".apply_viewId_input").val();
			var viewPwd = $(".apply_viewPwd_input").val();
			var serverId = $(".apply_serverId_input").val();
			var serverPwd = $(".apply_serverPwd_input").val();
			var groupId = $(".apply_groupId_input").val();
			if(!eName || !eDescription || ! eType || !linkMan || !telephone || !email || !password || !viewId || !viewPwd || !serverId || !serverPwd || !groupId){
				return;
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				equipJson: JSON.stringify({
					teamId: userData.teamId,
					uid: userData.uId,
					eName: eName,
					eDescription: eDescription,
					eType: eType,
					linkMan: linkMan,
					telephone: telephone,
					email: email,
					password: password,
					viewId: viewId,
					viewPwd: viewPwd,
					serverId: serverId,
					serverPwd: serverPwd,
					groupId: groupId
				})
			}
			$.post("/EquipmentManage.aspx?method=AddEquipment",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://添加成功
						getEquipmentList();
						$(".project_create").hide();
						$(".project_main_region").show();
						break;
					case "2":
						break;
				}
			});
		});
		$(document).on("click",".equipment_delete_btn",function(e){
			e.preventDefault();
			var eid = $(this).attr("data-eid");
			var top = $(this).offset().top + 20;
			var left = $(this).offset().left - 210;
			$("._tt_dialog").css("top", top);
			$("._tt_dialog").css("left", left);
			$("._tt_dialog").show();
			$("._tt_dialog .sure_dialog").attr("data-eid",eid);
		});
		$(document).on("click","._tt_dialog .cancel_dialog",function(e){
			e.preventDefault();
			$("._tt_dialog").hide();
		});
		$(document).on("click","._tt_dialog .sure_dialog",function(e){
			e.preventDefault();
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				eid: $(this).attr("data-eid")
			};
			$.post("/EquipmentManage.aspx?method=DeleteEquipment",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://删除成功
						$("._tt_dialog").hide();
						getEquipmentList();
						break;
					case "2":
						break;
				}
			});
		});
		$(document).on("click",".equipment_update_btn",function(e){
			e.preventDefault();
			var that = this;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				eid: $(this).attr("data-eid")
			};
			$.post("/EquipmentManage.aspx?method=GetEquipmentInfo",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://成功
						equipmentInfo = JSON.parse(d.ResultString);
						var top = $(that).offset().top + 20;
						var left = $(that).offset().left - 350;
						$(".equipmentupdate").css("top", top);
						$(".equipmentupdate").css("left", left);
						$(".equipmentupdate").show();
						$(".equipment_update_sure").attr("data-eid",equipmentInfo.eId)
						$("#inputName").val(equipmentInfo.eName);
						$("#inputDescription").val(equipmentInfo.eDescription);
						$("#inputType").val(equipmentInfo.eType);
						$("#inputlinkMan").val(equipmentInfo.linkMan);
						$("#inputPhone").val(equipmentInfo.telephone);
						$("#inputEmail").val(equipmentInfo.email);
						$("#inputPassword").val(equipmentInfo.password);

						$("#inputviewId").val(equipmentInfo.viewId);
						$("#inputviewPwd").val(equipmentInfo.viewPwd);
						$("#inputserverId").val(equipmentInfo.serverId);
						$("#inputserverPwd").val(equipmentInfo.serverPwd);
						$("#inputgroupId").val(equipmentInfo.groupId);
						break;
					case "2":
						break;
				}
			});
		});
		$(document).on("click",".equipment_update_cancel",function(e){
			e.preventDefault();
			$(".equipmentupdate").hide();
		});
		$(document).on("click",".equipment_update_sure",function(e){
			e.preventDefault();
			var eid = $(this).attr("data-eid");
			var eName = $("#inputName").val();
			var eDescription = $("#inputDescription").val();
			var eType  = $("#inputType").val();
			var linkMan = $("#inputlinkMan").val();
			var telephone = $("#inputPhone").val();
			var email = $("#inputEmail").val();
			var password = $("#inputPassword").val();

			var viewId  = $("#inputviewId").val();
			var viewPwd = $("#inputviewPwd").val();
			var serverId = $("#inputserverId").val();
			var serverPwd = $("#inputserverPwd").val();
			var groupId = $("#inputgroupId").val();
			if(!eName || !eDescription || ! eType || !linkMan || !telephone || !email || !password || !viewId || !viewPwd || !serverId || !serverPwd || !groupId){
				return;
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				equipJson: JSON.stringify({
					eId: eid,
					uid: userData.uId,
					teamId: userData.teamId,
					eName: eName,
					eDescription: eDescription,
					eType: eType,
					linkMan: linkMan,
					telephone: telephone,
					email: email,
					password: password,
					ip: equipmentInfo.ip,
					port: equipmentInfo.port,
					createTime: equipmentInfo.createTime,
					status: equipmentInfo.status,
					viewId: viewId,
					viewPwd: viewPwd,
					serverId: serverId,
					serverPwd: serverPwd,
					groupId: groupId
				})
			}
			$.post("/EquipmentManage.aspx?method=EditEquipment",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://成功
						getEquipmentList();
						$(".equipmentupdate").hide();
						break;
					case "2":
						break;
				}
			});
		});
	}
	function getEquipmentList(){
		var data = {
			token: localStorage.token,
			uid: userData.uId,
			teamId: userData.teamId
		};
		$.post("/EquipmentManage.aspx?method=GetEquipment",data).then(function(result){
			var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://登录成功
						var data = {
                            list: JSON.parse(d.ResultString)
                        };
                        var render = _.template($("#equipment_list").html());
                        var html = render(data);
                        $(".report_container").html(html);
						break;
					case "2":
						var data = {
                            list: []
                        };
                        var render = _.template($("#equipment_list").html());
                        var html = render(data);
                        $(".report_container").html(html);
						break;
				}
		})
	}
});