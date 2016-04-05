require.config({
    paths: {
        jquery: "jquery-2.1.4.min",
        tipsy: "jquery.tipsy",
        datetimepicker: "bootstrap-datetimepicker.min",
        underscore: "underscore-min",
        ztreecore: "./ztree/jquery.ztree.core-3.5",
        ztreeexcheck: "./ztree/jquery.ztree.excheck-3.5",
        ztreeexedit: "./ztree/jquery.ztree.exedit-3.5",
        layer: "layer/layer"
    },
    waitSeconds: 0,
    urlArgs: "v=4",//设置版本号
    shim: {
    	"tipsy": {
    		deps: ["jquery"]
    	},
    	"ztreecore": {
    		deps: ["jquery"]
    	},
    	"ztreeexcheck": {
    		deps: ["jquery"]
    	},
    	"ztreeexedit": {
    		deps: ["jquery"]
    	},
    	"layer": {
    		deps: ["jquery"]
    	},
    	"datetimepicker": {
    		deps: ["jquery"]
    	}
    }
});
require(["jquery","common","tipsy","underscore","ztreecore","ztreeexcheck","ztreeexedit","layer"],function($,common){
	function phoneTest(str){//手机号格式判断
		if(/^1\d{10}$/.test(str)){
			return true;
		}else {
			return false;
		}
	}
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
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		if(userData.rLevel != "0"){
			$(".handle_toa").show();
		}
		//提示
		$('[original-title]').tipsy({
			fade: true,
			gravity: 'n'
		});
		//获取部门列表
		var tData = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token
		}
		var getData = {
			uid: userData.uId,
			teamid: userData.teamId,
			token: localStorage.token
		}
		$.when($.post("/DepartmentManage.aspx?method=GetDepartmentList", tData),$.post("/TeamManage.aspx?method=GetTeamInfo",getData)).then(function(result1,result2){
			if(result1[1] != "success" || result2[1] != "success") return;
			var d1 = JSON.parse(result1[0]);
			var d2 = JSON.parse(result2[0]);
			if(d1.Result == "1" && d2.Result == "1"){
				var teamlist = JSON.parse(d1.ResultString);
				var zNodes = [];
				var teamDesc = JSON.parse(d2.ResultString);
				teamDesc = teamDesc[0];
				zNodes.push({ id: 0, pId: 0, name: teamDesc.teamAllName, open:true});
				$("#shortName").val(teamDesc.teamShortName);
				$("#fullName").val(teamDesc.teamAllName);
				$("#inviteCode").val(teamDesc.InvitationCode);
				$("#departmentName").html(teamDesc.teamAllName);
				if(teamDesc.logoImg) $(".logoimg img").attr("src",teamDesc.logoImg);						
				if (teamlist.length) {
					$.each(teamlist, function(index, item) {
						zNodes.push({
							id: item.dId,
							pId: 0,
							name: item.dName,
							open: true
						});
					});
				}
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
				var nodes = treeObj.getNodes();
				EachChildNodes(nodes[0]);
			}
		});
		getUserlist();
		common.logout();
		//更新用户
		$(document).on("click", ".user_update", function(e){
			e.preventDefault();
			var top = $(this).offset().top + 20;
			var left = $(this).offset().left;
			var userintro = JSON.parse(decodeURIComponent($(this).attr("data-intro")));
			$(".userupdate").css("top", top);
			$(".userupdate").css("left", left);
			$(".userupdate").show();
			$(".userupdate").attr("data-uid",userintro.uId);
			$(".userupdate").attr("data-deid",userintro.deId);
			$(".userupdate #inputName").val(userintro.nickName);
			$(".userupdate #inputPhone").val(userintro.userName);
			$(".userupdate .selectJob").val(userintro.dRole);
			$(".userupdate .selectTeam option").each(function(){
				if($(this).text() == userintro.dName){
					$(this).attr("selected",true);
				}
			});
		});
		$(document).on("click", ".userupdate .transfer_ocpw", function(e){//更新用户确认
			e.preventDefault();
			var name = $(".userupdate #inputName").val();
			var phone = $(".userupdate #inputPhone").val();
			var jobid = $(".userupdate .selectJob").val();
			var did = $(".userupdate .selectTeam").val();
			var uid = $(".userupdate").attr("data-uid");
			var deid = $(".userupdate").attr("data-deid");
			var data = {
				token: userData.token,
				uid: userData.uId,
				teamid: userData.teamId,
				name: name,
				phone: phone,
				jobid: jobid,
				did: did,
				userid: uid,
				deid: deid
			}
			$.post("/UserManage.aspx?method=EditUser", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						getUserlist();
						$(".userupdate").hide();
						break;
					case "2":
						layer.msg('该手机号已存在，请修改！',{time:2000});
						break;
					case "3":
						layer.msg('手机号码格式错误！',{time:2000});
						break;
				}
			});
		});
		$(document).on("click", ".userupdate .cancel_ocpw", function(e){//更新用户取消
			e.preventDefault();
			$(".userupdate").hide();
		});
		//删除用户
		$(document).on("click", ".user_delete", function(e){
			e.preventDefault();
			var deid = $(this).attr("data-deid");
			var uid = $(this).attr("data-uid");
			var top = $(this).offset().top + 20;
			var left = $(this).offset().left - 150;
			$("._tt_dialog").css("top", top);
			$("._tt_dialog").css("left", left);
			$("._tt_dialog").show();
			$("._tt_dialog .sure_dialog").attr("data-deid",deid);
			$("._tt_dialog .sure_dialog").attr("data-uid",uid);
		});
		$(document).on("click","._tt_dialog .cancel_dialog",function(e){
			e.preventDefault();
			$("._tt_dialog").hide();
		});
		$(document).on("click", "._tt_dialog .sure_dialog", function(e){
			e.preventDefault();
			var that = this;
			var uid = $(that).attr("data-uid");
			var deid = $(that).attr("data-deid");
			var data = {
				token: userData.token,
				uid: userData.uId,
				userid: uid,
				deid: deid
			}
			$.post("/UserManage.aspx?method=DeleteUser",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						getUserlist();
						$("._tt_dialog").hide();
						break;
				}
			});		
		});
		//搜索用户
		$(document).on("click", "#searchBtn", function(e){
			e.preventDefault();
			$(".resultsearch_oa").html("");
			var value = $("#searchStaff input").val();
			var type = "";
			if(!value) return;
			phoneTest(value)? type=2: type=1;
			var data = {
				token: userData.token,
				uid: userData.uId,
				teamid: userData.teamId,
				value: value,
				type: type
			};
			$.post("/UserManage.aspx?method=SearchUser",data).then(function(result){
				var d = JSON.parse(result);
					switch (d.Result) {
						case "0":					
							break;
						case "1":
							var searchuser = JSON.parse(d.ResultString);
							if(searchuser.length){
								var data = {
									userlist: searchuser
								};
								var render = _.template($("#userlist").html());
								var html = render(data);
								$(".userlist").html(html);
							}else{
								$(".resultsearch_oa").show();
								$(".resultsearch_oa").html("搜索结果为空!");
							}						
							break;
					}
			});
		})
		var setting = {
			view: {
				addHoverDom: addHoverDom,
				removeHoverDom: removeHoverDom,
				selectedMulti: false
			},
			edit: {
				enable: true,
				editNameSelectAll: true,
				showRemoveBtn: showRemoveBtn,
				showRenameBtn: showRenameBtn
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				beforeDrag: beforeDrag,
				beforeEditName: beforeEditName,
				beforeRemove: beforeRemove,
				beforeRename: beforeRename,
				onRemove: onRemove,
				onRename: onRename,
				onClick: onClick
			}
		};

		/*var zNodes =[
			{ id:1, pId:0, name:"易为码", open:true},
			{ id:2, pId:1, name:"PT事业部", open:true},
			{ id:3, pId:2, name:"前端", open:true},
			{ id:4, pId:2, name:"IOS", open:true},
			{ id:5, pId:2, name:"UI", open:true},
			{ id:6, pId:1, name:"市场部", open:true},
			{ id:7, pId:6, name:"售前", open:true},
			{ id:8, pId:6, name:"售后", open:true},
			{ id:9, pId:6, name:"运营", open:true},
			{ id:10, pId:1, name:"人事部", open:true},
			{ id:11, pId:1, name:"财务部", open:true},
			{ id:12, pId:1, name:"前台", open:true}
		];*/

		function beforeDrag(treeId, treeNodes) {
			return false;
		}

		function beforeEditName(treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.selectNode(treeNode);
			return true;
		}

		function beforeRemove(treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.selectNode(treeNode);
			/*layer.confirm("确认删除 " + treeNode.name + " 吗？", {title:'提示'}, function(index){
			    //do something
			    layer.close(index);
			    var data = {
					token: userData.token,
					userid: userData.uId,
					teamid: userData.teamId,
					did: treeNode.id
				}
				$.post("/DepartmentManage.aspx?method=Deletedepartment", data).then(function(result) {//删除部门
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							return false;
							break;
						case "1":						
							return true;
							break;
					}
				});
			},function(index){
				layer.close(index);
				return false;
			}); */
			
			if (confirm("确认删除 " + treeNode.name + " 吗？")) {
				var data = {
					token: userData.token,
					uid: userData.uId,
					teamid: userData.teamId,
					did: treeNode.id
				}
				$.post("/DepartmentManage.aspx?method=Deletedepartment", data).then(function(result) {//删除部门
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							return false;
							break;
						case "1":
							return true;
							break;
					}
				});
			} else {
				return false;
			}
		}

		function onRemove(e, treeId, treeNode) {}

		function beforeRename(treeId, treeNode, newName, isCancel) {
			console.log(treeNode);
			if (newName.length == 0) {
				layer.msg('请输入部门名称！',{time:2000});
				var zTree = $.fn.zTree.getZTreeObj("treeDemo");
				setTimeout(function() {
					zTree.editName(treeNode)
				}, 10);
				return false;
			}
			var departmentJson = {dId: treeNode.id, teamId: userData.teamId.toString(), dName: newName};
			var data = {
				token: userData.token,
				uid: userData.uId,
				departmentJson: JSON.stringify(departmentJson)
			}
			$.post("/DepartmentManage.aspx?method=AddAndEditdepartment", data).then(function(result) {//更新部门名称
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						alert(d.Tip);
						return false;
						break;
					case "1":
						getUserlist();
						return true;
						break;
					case "2":
						alert(d.Tip);
						return false;
						break;
				}
			});

		}

		function onRename(e, treeId, treeNode, isCancel) {
			//console.log(treeNode); //获取该节点的数据
		}

		function showRemoveBtn(treeId, treeNode) {
			//return !treeNode.isFirstNode;
			return treeNode.id != 0;
		}

		function showRenameBtn(treeId, treeNode) {
			//return !treeNode.isLastNode;
			return treeNode.id != 0;
		}

		function getTime() {
			var now = new Date(),
				h = now.getHours(),
				m = now.getMinutes(),
				s = now.getSeconds(),
				ms = now.getMilliseconds();
			return (h + ":" + m + ":" + s + " " + ms);
		}

		var newCount = 1;

		function addHoverDom(treeId, treeNode) {
			var sObj = $("#" + treeNode.tId + "_span");
			if(treeNode.id != 0) return;
			if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
			var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='添加部门' onfocus='this.blur();'></span>";
			sObj.after(addStr);
			var btn = $("#addBtn_" + treeNode.tId);
			if (btn) btn.bind("click", function() {
				var top = $(this).offset().top;
				var left = $(this).offset().left + 20;
				$(".teamadd").css("top", top);
				$(".teamadd").css("left", left);
				$(".teamadd").show();
				$(".input_team_name input").val("");
				$(".teamadd .transfer_ocpw").on("click", function(e) {
					var zTree = $.fn.zTree.getZTreeObj("treeDemo");
					var name = $(".input_team_name input").val();
					//zTree.addNodes(treeNode, {id: (100 + newCount), pId:treeNode.id, name: name});
					var departmentJson = {teamId: userData.teamId,dName: name};						
					var data = {
						token: userData.token,
						uid: userData.uId,
						departmentJson: JSON.stringify(departmentJson)
					};
					$.post("/DepartmentManage.aspx?method=AddAndEditdepartment", data).then(function(result) {
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								$(".teamadd .errortip_cpw").html("已有该部门！");
								$(".teamadd .errortip_cpw").show();
								break;
							case "1":
								$(".teamadd").hide();
								location.reload();
								break;
							case "2":
								$(".teamadd .errortip_cpw").html(d.Tip);
								break;
						}
					});					
					//zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
				});
				$(".teamadd .cancel_ocpw").on("click", function(e) {
					e.preventDefault();
					$(".teamadd").hide();
					$(".teamadd .errortip_cpw").hide();
					$(".teamadd .transfer_ocpw").off("click");
				});
				return false;
			});
		};

		function removeHoverDom(treeId, treeNode) {
			$("#addBtn_" + treeNode.tId).unbind().remove();
		};

		function onClick(event, treeId, treeNode) { //点击部门事件
			if(treeNode.pId == null){
				getUserlist();
				return;
			}
			var departmentUser = [];
			$.each(userlist,function(index,item){
				if(item.dName == treeNode.name){
					departmentUser.push(item);
				}
			});
			if(departmentUser.length){
				var data = {
					userlist: departmentUser
				};
				var render = _.template($("#userlist").html());
				var html = render(data);
				$(".userlist").html(html);
				$("._tt_emptyplanlist").hide();
			}else{
				$(".userlist").html("");
				$("._tt_emptyplanlist").show();
			}
			
			//$("#sumup").html(userlist.length);//员工数量
		}
		function EachChildNodes(treeObj) {
			//判断是否有子节点
			if (treeObj.children == undefined) {
				$(".popupwrap .selectTeam")[0].options.add(new Option(treeObj.name, treeObj.id)); //添加到部门选择中
				$(".userupdate .selectTeam")[0].options.add(new Option(treeObj.name, treeObj.id)); 
				return;
			}
			for (var i = 0; i < treeObj.children.length; i++) {
				EachChildNodes(treeObj.children[i]);
			}
		}
		//新增员工
		$(".addemployees_htoa").on("click", function(e) {
			e.preventDefault();
			var top = $(".addemployees_htoa").offset().top + 32;
			var left = $(".addemployees_htoa").offset().left;
			$(".popupwrap").css("top", top);
			$(".popupwrap").css("left", left);
			$(".popupwrap").show();
			$(".popupwrap #inputName").val("");
			$(".popupwrap #inputPhone").val("");
			$(".popupwrap .selectJob").val("");
			$(".popupwrap .selectTeam").val("");
		});
		$(".popupwrap .transfer_ocpw").on("click", function(e) {//确认添加用户
			e.preventDefault();
			var name = $(".popupwrap #inputName").val();
			var phone = $(".popupwrap #inputPhone").val();
			var jobid = $(".popupwrap .selectJob").val();
			var did = $(".popupwrap .selectTeam").val();
			if(!name){
				layer.msg('请输入用户姓名！',{time:2000});
				return;
			}
			if(!phone){
				layer.msg('请输入用户手机号！',{time:2000});
				return;
			}
			if(!jobid){
				layer.msg('请输入用户职位！',{time:2000});
				return;
			}
			if(!did){
				layer.msg('请输入用户部门！',{time:2000});
				return;
			}
			var data = {
				token: userData.token,
				uid: userData.uId,
				teamid: userData.teamId,
				name: name,
				phone: phone,
				jobid: jobid,
				did: did
			}
			$.post("/UserManage.aspx?method=AddUser", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						getUserlist();
						$(".popupwrap").hide();
						break;
					case "2":
						layer.msg('该手机号已存在，请修改！',{time:2000});
						break;
					case "3":
						layer.msg('手机号码格式错误！',{time:2000});
						break;
				}
			});
		});
		$(".popupwrap .cancel_ocpw").on("click", function(e) {
			e.preventDefault();
			$(".popupwrap").hide();
		});
		$("#btnSave").on("click", function(e) {
			e.preventDefault();
			var fullName = $("#fullName").val();
			var shortName = $("#shortName").val();
			var InvitationCode = $("#inviteCode").val();
			if(!shortName){
				layer.msg('请输入团队简称！',{time:2000});
				return;
			}
			if(!fullName){
				layer.msg('请输入团队全称！',{time:2000});
				return;
			}
			if(!InvitationCode){
				layer.msg('请输入团队邀请码！',{time:2000});
				return;
			}
			var data = {
				token: userData.token,
				uid: userData.uId,
				teamid: userData.teamId,
				fullName: fullName,
				shortName: shortName,
				InvitationCode: InvitationCode
			};
			$.post("/TeamManage.aspx?method=EditTeam", data).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						alert("修改成功");
						break;
				}
			});
		});
		//上传团队图片
		$("#teamImg").on("click", function(e) {
			e.preventDefault();
			if(!$("#File1")[0].files[0]){
				layer.msg('请选择团队图片！',{time:2000});
				return;
			}
			var formData = new FormData();
			formData.append("teamid", userData.teamId);
			formData.append("uid", userData.uId);
			formData.append("token", localStorage.token);
			formData.append("file", $("#File1")[0].files[0]);
			$.ajax({
				url: "/TeamManage.aspx?method=TeamImgUpload", //server script to process data
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
							$(".logoimg img").attr("src",d.ResultString);
							break;
					}
				}
			});
		});
	}
	//获取用户列表
	function getUserlist(){
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
					userlist = JSON.parse(d.ResultString);
					var data = {
						userlist: userlist,
						rLevel: userData.rLevel,
						uid: userData.uId
					};
					var render = _.template($("#userlist").html());
					var html = render(data);
					$(".userlist").html(html);
					$("#sumup").html(userlist.length);//员工数量
					$("._tt_emptyplanlist").hide();
					break;
			}
		});
	}
});