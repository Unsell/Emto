require.config({
	paths: {
		jquery: "jquery-2.1.4.min",
		tipsy: "jquery.tipsy",
		datetimepicker: "bootstrap-datetimepicker.min",
		underscore: "underscore-min",
		gantt: "jsgantt1",
        layer: "layer/layer"
	},
	urlArgs: "v=9", //设置版本号
	shim: {
		"tipsy": {
			deps: ["jquery"]
		},
		"datetimepicker": {
			deps: ["jquery"]
		},
		"gantt": {
			deps: ["jquery"]
		},
    	"layer": {
    		deps: ["jquery"]
    	}
	}
});
require(["jquery","common", "tipsy", "datetimepicker", "underscore", "gantt","layer"], function($,common) {
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
		//模板渲染
		$(".radius_img30").html(userData.nickName.substring(0,1));
		$(".name_tthn").html(userData.nickName);
		$(".brand").html(userData.teamShortName);
		common.logout();
		var workdata = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token
		}
		$.post("/ProjectManage.aspx?method=GetProjectList",workdata).then(function(result){
			var d = JSON.parse(result);
			switch(d.Result){
				case "0": 
					break;
				case "1"://
					var list = JSON.parse(d.ResultString);
					worklist = list.dataList;
					unfinish = [];
					finish = [];
					$.each(worklist,function(index,item){
						if(item.pStatus == 0 || item.pStatus == 1 || item.pStatus == 2){
							unfinish.push(item);
						}else{
							finish.push(item);
						}
					});					
					var data = {
						worklist: worklist,
						unfinish: unfinish,
						finish: finish
					};
					var render = _.template($("#project_worklist").html());
					var html = render(data);
					$(".worklist_sidenav").html(html);
					var render = _.template($("#project_userwork").html());
					var html = render(data);
					$(".project_main_region").html(html);
					break;
				case "2":
					break;
			}
		});	
		var height = $(document).height();
		$("#main-region").css("min-height",height);
		$("#work_main_region").css("min-height",height);
		//初始化新建项目起止时间
		var sdate = common.GetDateStr(0);
		var edate = common.GetDateStr(6);
		$(".project_input_container .project_date").attr("data-sdate",sdate);
		$(".project_input_container .project_date").attr("data-edate",edate);
		$(".project_input_container .project_date").val(sdate + " 至 " + edate);
		$(".project_input_container .radius_img30").html(userData.nickName.substring(0,1));
		$(".project_input_container .place_holder").html(userData.nickName);//设置发起人
		$(".task-create-tools-item-wraper .task-create-applyuser-icon").html("发起人："+userData.nickName);
		$('[original-title]').tipsy({
			fade: true,
			gravity: 'n'
		});
		$(document).on("click", ".project_more_info_btn", function(e) {
			e.preventDefault();
			if ($(".project_list_create_info").css("display") == "none") {
				$(".project_list_create_info").slideDown(500);
			} else {
				$(".project_list_create_info").slideUp(500);
			}
		});
		/*$(document).on("click",function(e){
			console.log(e);
			var className = e.target.className;
			if(className != "btn project_detail_operate_btn" && className != "icon icon-arrow-down"){
				$(".btn-list").hide();
			}
		});*/
		$(document).on("click",function(e){
			e = window.event || e; // 兼容IE7
			obj = $(e.srcElement || e.target);
			if (!$(obj).is(".btn-list,.btn-list *") && !$(obj).is(".project_detail_operate_btn, .project_detail_operate_btn *")) {
				$(".btn-list").hide();
			}
			if (!$(obj).is(".smember_container,.smember_container *,.task-create-principle,.task-create-principle *,.ux_add_btn,.project_add_btn,.project_add_btn *,.member_add_big,.member_add_big *,.taskdetail-add-partner")) {
				$(".smember_container").hide();
			}
			if (!$(obj).is(".tt_changestatusview,.tt_changestatusview *,.plandetail_status,.plandetail_status *")) {
				$(".tt_changestatusview").hide();
			}
		});
		$(document).on("click", ".project_list_create .project_create_btn", function(e) {
			e.preventDefault();
			$(".project_create").show();
			$(".project_main_region").hide();
		});		
		$(document).on("click", ".project_info_add", function(e) {
			e.preventDefault();
			$(".project_create").show();
			$(".project_main_region").hide();
		});
		$(".list-wraper a[data-name]").on("click", function(e) {
			e.preventDefault();
			if(e.target.className == "icon-arrow-down" || e.target.className == "icon-arrow-up") return;
			if($(this).parent().hasClass("active")) return;
			var type = $(this).attr("data-name");
			switch(type){
				case "respon-title":
					var workdata = {
						teamid: userData.teamId,
						uid: userData.uId,
						token: localStorage.token
					}
					$.post("/ProjectManage.aspx?method=GetProjectList",workdata).then(function(result){
						var d = JSON.parse(result);
						switch(d.Result){
							case "0": 
								break;
							case "1"://
								var list = JSON.parse(d.ResultString);
								worklist = list.dataList;
								unfinish = [];
								finish = [];
								$.each(worklist,function(index,item){
									if(item.pStatus == 0 || item.pStatus == 1 || item.pStatus == 2){
										unfinish.push(item);
									}else{
										finish.push(item);
									}
								});
								var data = {
									worklist: worklist,
									unfinish: unfinish,
									finish: finish
								};
								var render = _.template($("#project_worklist").html());
								var html = render(data);
								$(".worklist_sidenav").html(html);
								var render = _.template($("#project_userwork").html());
								var html = render(data);
								$(".project_main_region").html(html);
								//重置搜索框
								$(".search-form-list").removeClass("focus");
								$(".search-form-list .cancel").addClass("hide");
								$(".input-default input").val("");
								break;
							case "2":
								break;
						}
					});
					$(".project_create").hide(); //隐藏新建项目
					$(".project_main_region").show();
					break;
			}
			
			$(".list-wraper .active").removeClass("active");
			$(this).parent().addClass("active");
			//$(".list-wraper .li_parent").addClass("active");
		});
		//项目搜索
		$(document).on("focus", ".input-default input", function(e) { //搜索框输入
			e.preventDefault();
			$(".search-form-list").addClass("focus");
			$(".search-form-list .cancel").removeClass("hide");
		});
		$(".search-form-list .cancel").on("click", function(e) { //取消搜索
			e.preventDefault();
			$(".search-form-list").removeClass("focus");
			$(".search-form-list .cancel").addClass("hide");
			$(".input-default input").val("");
			var data = {
				worklist: worklist
			};
			var render = _.template($("#project_worklist").html());
			var html = render(data);
			$(".worklist_sidenav").html(html);
		});
		$(document).on("click", ".icon-search", function(e){ //确认搜索
			e.preventDefault();
			var searchValue = $(".search-form-list input").val();
			if(!searchValue) return;
			var result = [];
			$.each(worklist,function(index,item){
				if(item.pName.indexOf(searchValue) > -1){
					result.push(this);
				}
			});
			console.log(result);
			var data = {
				worklist: result
			};
			var render = _.template($("#project_worklist").html());
			var html = render(data);
			$(".worklist_sidenav").html(html);
			//$(".worklist_title").html("搜索结果");
		});
		$(document).on("click", ".worklist_sidenav a", function(e) {//项目列表选择 左侧
			e.preventDefault();
			var that = this;
			var pid = $(that).attr("data-id");
			if($(that).parent().hasClass("active")) return;
			$(".project_create").hide(); //隐藏新建项目
			$(".project_main_region").show(); //显示右侧主区域
			$(".list-wraper .active").removeClass("active");
			$(that).parent().addClass("active");
			/*$.each(worklist,function(index,item){
				if(item.pId == pid){
					data = {
						work: this
					}
					//当前项目信息
					projectInfo = this;
					console.log(data);
					return false;
				}
			});
			console.log(data);
			var render = _.template($("#project_detail").html());
			var html = render(data);
			$(".project_main_region").html(html);*/
			getProjectInfo(pid);
			//设置项目动态
			//setProjectFeed(pid);
			//获取成员信息，用于更新项目信息
			//getProjectUser(pid);
			//设置项目状态
			//$(".project_detail_top_btn_creater li[data-type="+projectInfo.pStatus+"]").addClass("active");
		});
		$(document).on("click", ".project_list_panel .project_list_item", function(e) {//项目列表选择 右侧
			e.preventDefault();
			var that = this;
			var pid = $(that).attr("data-id");
			getProjectInfo(pid);
			//选中左侧列表相对应项目
			$(".list-wraper .active").removeClass("active");
			$(".worklist_sidenav a[data-id="+pid+"]").parent().addClass("active");
		});
		$(".arrow-btn").on("click",function(e){
			e.preventDefault();
			var list = $(this).parent().parent().find("ul");
			if(list.css("display") == "none"){
				list.slideDown();
				$(this).find(".icon-arrow-down").addClass("icon-arrow-up");
				$(this).find(".icon-arrow-down").removeClass("icon-arrow-down");
			}else{
				list.slideUp();
				$(this).find(".icon-arrow-up").addClass("icon-arrow-down");
				$(this).find(".icon-arrow-up").removeClass("icon-arrow-up");
			}
		});

		$(document).on("click", ".project_detail_nav li", function(e) {//项目分栏切换
			e.preventDefault();
			var type = $(this).find("a").attr("data-type");
			var pid = $("#project_detail_tab_container").attr("data-id");
			$(".project_detail_nav .active").removeClass("active");
			$(this).addClass("active");
			$(".pull-screen-container").hide();
			switch (type) {
				case "feed":
					//设置项目动态
					setProjectFeed(pid);
					break;
				case "task":
					setProjectTask(pid);
					break;
				case "user":					
					setProjectUser(pid);
					break;
				case "operate":
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						teamid: userData.teamId,
						pid: pid
					}
					$.post("/ProjectManage.aspx?method=GetShareByPid",data).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								var feedlist = JSON.parse(d.ResultString).dataList;
								var feeddata = {
									feedlist: feedlist
								};
								var render = _.template($("#project_operate").html());
								var html = render(feeddata);
								$(".project_detail_content").html(html);
								break;
						}
					});				
					break;
				case "gantt":
					var data = {};
					var render = _.template($("#project_gantt").html());
					var html = render(data);
					$(".project_detail_content").html(html);
					var tData = {
						teamid: userData.teamId,
						uid: userData.uId,
						token: localStorage.token,
						ftId: $("#project_detail_tab_container").attr("data-id")
					}
					$.post("/ProjectManage.aspx?method=GetTaskByProject", tData).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
//								console.log(d);
								var task = d.ResultString.dataList;
								console.log(task);
								if(task.length == 0){
									$(".gantt_empty").show();
									return;
								}
								$(".gantt").show();
								var ganttData = [];
								var status = {0:"未开始",1:"进行中",2:"已延期",3:"已完成"};
								
								g = new JSGantt.GanttChart('g',document.getElementById('GanttChartDIV'), 'day');
								
								g.setShowRes(1); // Show/Hide Responsible (0/1)
								g.setShowDur(0); // Show/Hide Duration (0/1)
								g.setShowComp(1); // Show/Hide % Complete(0/1)
							    g.setCaptionType('Resource');  // Set to Show Caption (None,Caption,Resource,Duration,Complete)
								
								if( g ) {
		
								    // Parameters             (pID, pName,                  pStart,      pEnd,        pColor,   pLink,          pMile, pRes,  pComp, pGroup, pParent, pOpen, pDepend, pCaption)
									
									// You can also use the XML file parser JSGantt.parseXML('project.xml',g)
									
									function  DateDiff(sDate1,  sDate2){    //sDate1和sDate2是2006-12-18格式  计算相差天数
									       var  aDate,  oDate1,  oDate2,  iDays;  
									       aDate  =  sDate1.split("-");  
									       oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]); //转换为12-18-2006格式  
									       aDate  =  sDate2.split("-");  
									       oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);  
									       iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24); //把相差的毫秒数转换为天数  
									       return  iDays;  
									   } 
									var data = new Date();
										if((parseInt(data.getMonth())+1)<10){ // 处理时间的格式
											if(data.getDate()<10){
												var nowtime = data.getFullYear() + '-0' + (parseInt(data.getMonth())+1) + '-0' + data.getDate();
											}else{
												var nowtime = data.getFullYear() + '-0' + (parseInt(data.getMonth())+1) + '-' + data.getDate();
											}
										}else{
											if(data.getDate()<10){
												var nowtime = data.getFullYear() + '-' + (parseInt(data.getMonth())+1) + '-0' + data.getDate();
											}else{
												var nowtime = data.getFullYear() + '-' + (parseInt(data.getMonth())+1) + '-' + data.getDate();
											}
										}
									
									$.each(task,function(i,item){
										
										
										
										var hasChild = 0;
										if(item.ChildTask.length > 0){
											var startTime = item.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
											var endTime = item.tEndDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
											g.AddTaskItem(new JSGantt.TaskItem(item.tId, item.tName, startTime, endTime, '74BDFF', '', 0, item.proposerName, item.tSchedule, 1, 0, 1,'','', status[item.tStatus]));
										}else{
											if(item.tStatus==3 || item.tStatus==1 ){
												var startTime = item.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
												var endTime = item.tEndDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
												if(item.tStatus==3){
													g.AddTaskItem(new JSGantt.TaskItem(item.tId, item.tName, startTime, endTime, '74BDFF', '', 0, item.proposerName, item.tSchedule, 0, 0, 1,'','', status[item.tStatus]));
												}else{
													g.AddTaskItem(new JSGantt.TaskItem(item.tId, item.tName, startTime, endTime, '74BDFF', '', 0, item.proposerName, 0, 0, 0, 1,'','', status[item.tStatus]));
													//$('#child_'+childitem.tId).find('.schedule').find('nobr').html(item.tSchedule);
												}
											}else{
												
												if((new Date(nowtime).getTime()-new Date(item.tEndDate.replace(/\//g, '-')).getTime())>0){
															
													//console.log(DateDiff( nowtime, childitem.tEndDate.replace(/\//g, '-') ));
													var taskDays = DateDiff( item.tStartDate.replace(/\//g, '-'),item.tEndDate.replace(/\//g, '-') )+1; // 任务天数
													var actualDays = DateDiff( item.tStartDate.replace(/\//g, '-'),nowtime )+1; // 任务开始到现在的天数
													
													var percentageDay = Math.round(taskDays*100/actualDays);
													
													var startTime = item.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
													//console.log(childitem.tEndDate+'==============');
													//console.log(nowtime);
													nowtime = nowtime.replace(/-/g, '/');
													//console.log(nowtime);
													var endTime = nowtime.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
													
													g.AddTaskItem(new JSGantt.TaskItem(item.tId, item.tName, startTime, endTime, 'ff0000', '', 0, item.proposerName, percentageDay, 0, 0, 1,'','', status[item.tStatus]));
//															$('#taskbar_'+childitem.tId).find('.gcomplete').css('background-color', "#74BDFF");
//															if(childitem.tStatus==2){
//																$('#child_'+childitem.tId).find('.schedule').find('nobr').html(childitem.tSchedule);
//																console.log(childitem.tSchedule);
//															}else{
//																$('#child_'+childitem.tId).find('.schedule').find('nobr').html("0");
//															}
													
												}else{
													var startTime = item.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
													var endTime = item.tEndDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
													//console.log( childitem.tId+'====='+ childitem.tName+'====='+ childStartTime+'====='+ childEndTime+'====='+ childitem.proposerName+'====='+ childitem.tSchedule+'====='+ typeof childitem.tSchedule +'====='+ hasChild+'====='+ typeof hasChild+'====='+ status[childitem.tStatus]  );
													//g.AddTaskItem(new JSGantt.TaskItem(childitem.tId, childitem.tName, childStartTime, childEndTime, '74BDFF', '', 0, childitem.proposerName, childitem.tSchedule, 0, childitem.ftId, 1,'','', status[childitem.tStatus]));
													g.AddTaskItem(new JSGantt.TaskItem(item.tId, item.tName, startTime, endTime, '74BDFF', '', 0, item.proposerName, item.tSchedule, 0, 0, 1,'','', status[item.tStatus]));
													//$('#taskbar_'+childitem.tId).find('.gcomplete').css('background-color', "#74BDFF");
												}
												
												
												
											}
										}
										
										if(item.ChildTask.length > 0){
											//console.log( item.tId+'====='+ item.tName+'====='+ startTime+'====='+ endTime+'====='+ item.proposerName+'====='+ item.tSchedule+'====='+ typeof item.tSchedule +'====='+ hasChild+'====='+ typeof hasChild+'====='+ status[item.tStatus]  );
											$.each(item.ChildTask,function(j,childitem){
												if(childitem != undefined && childitem.ftId == item.tId){
													
													
													if(childitem.tStatus==3 || childitem.tStatus==1 ){ // 任务已完成状态 和进行时
														//console.log( childitem.tId+'====='+ childitem.tName+'====='+ childStartTime+'====='+ childEndTime+'====='+ childitem.proposerName+'====='+ childitem.tSchedule+'====='+ typeof childitem.tSchedule +'====='+ hasChild+'====='+ typeof hasChild+'====='+ status[childitem.tStatus]  );
														var childStartTime = childitem.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
														var childEndTime = childitem.tEndDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
														
														
														if(childitem.tStatus==3){
															g.AddTaskItem(new JSGantt.TaskItem(childitem.tId, childitem.tName, childStartTime, childEndTime, '74BDFF', '', 0, childitem.proposerName, childitem.tSchedule, 0, childitem.ftId, 1,'','', status[childitem.tStatus]));
														}else{
															g.AddTaskItem(new JSGantt.TaskItem(childitem.tId, childitem.tName, childStartTime, childEndTime, '74BDFF', '', 0, childitem.proposerName, 0, 0, childitem.ftId, 1,'','', status[childitem.tStatus]));
															//console.log('#child_'+childitem.tId);
															//$('#child_'+childitem.tId).find('.schedule').find('nobr').html(childitem.tSchedule);
															//console.log(childitem.tSchedule);
														}
													
													}else{
														
														//console.log(DateDiff( nowtime, childitem.tEndDate.replace(/\//g, '-') +'+++++++++++++++++'));
														
														
														if((new Date(nowtime).getTime()-new Date(childitem.tEndDate.replace(/\//g, '-')).getTime())>0){
															
															//console.log(DateDiff( nowtime, childitem.tEndDate.replace(/\//g, '-') ));
															var taskDays = DateDiff( childitem.tStartDate.replace(/\//g, '-'),childitem.tEndDate.replace(/\//g, '-') )+1; // 任务天数
															var actualDays = DateDiff( childitem.tStartDate.replace(/\//g, '-'),nowtime )+1; // 任务开始到现在的天数
															
															var percentageDay = Math.round(taskDays*100/actualDays);
															
															var childStartTime = childitem.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
															//console.log(childitem.tEndDate+'==============');
															//console.log(nowtime);
															nowtime = nowtime.replace(/-/g, '/');
															//console.log(nowtime);
															var childEndTime = nowtime.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
															//console.log(percentageDay+"======"+childitem.tSchedule);
															//console.log(childEndTime);
															//console.log( childitem.tId+'====='+ childitem.tName+'====='+ childStartTime+'====='+ childEndTime+'====='+ childitem.proposerName+'====='+ childitem.tSchedule+'====='+ typeof childitem.tSchedule +'====='+ hasChild+'====='+ typeof hasChild+'====='+ status[childitem.tStatus]  );
															g.AddTaskItem(new JSGantt.TaskItem(childitem.tId, childitem.tName, childStartTime, childEndTime, 'ff0000', '', 0, childitem.proposerName, percentageDay, 0, childitem.ftId, 1,'','', status[childitem.tStatus]));
															
//															$('#taskbar_'+childitem.tId).find('.gcomplete').css('background-color', "#74BDFF");
//															if(childitem.tStatus==2){
//																$('#child_'+childitem.tId).find('.schedule').find('nobr').html(childitem.tSchedule);
//																console.log(childitem.tSchedule);
//															}else{
//																$('#child_'+childitem.tId).find('.schedule').find('nobr').html("0");
//															}
															
														}else{
															var childStartTime = childitem.tStartDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
															var childEndTime = childitem.tEndDate.replace( /(\d{4})\/(\d{2})\/(\d{2})/, "$2/$3/$1" );
															//console.log( childitem.tId+'====='+ childitem.tName+'====='+ childStartTime+'====='+ childEndTime+'====='+ childitem.proposerName+'====='+ childitem.tSchedule+'====='+ typeof childitem.tSchedule +'====='+ hasChild+'====='+ typeof hasChild+'====='+ status[childitem.tStatus]  );
															g.AddTaskItem(new JSGantt.TaskItem(childitem.tId, childitem.tName, childStartTime, childEndTime, '74BDFF', '', 0, childitem.proposerName, childitem.tSchedule, 0, childitem.ftId, 1,'','', status[childitem.tStatus]));
															//$('#taskbar_'+childitem.tId).find('.gcomplete').css('background-color', "#74BDFF");
														}
														
													}
												}
											});
										}
											
										
									});
									
//									g.AddTaskItem(new JSGantt.TaskItem(3,   '后端接口编写',      '',          '',          'ff0000', '', 0, '松风阁',     0, 1, 0, 1 , '', '', ''));
//		    						g.AddTaskItem(new JSGantt.TaskItem(31,  '日报接口',     '01/25/2015', '05/28/2016', '74BDFF', '', 0, '松风阁',    100, 0, 3, 1, '','', '已完成'));
//		    						g.AddTaskItem(new JSGantt.TaskItem(32,  '评论功能', '3/29/2016', '3/30/2016', '74BDFF', '', 0, 'Shlomy',   100, 0, 3, 1, '', '', '延期完成'));
									
								  
								
								    g.Draw();	
								    g.DrawDependencies();
								    
								    $('#rightside').css('width', $('#GanttChartDIV').width() - $('#leftside').width());
									//							console.log($('.today').offset().left);
									// 让滚动条移动到表示今天的位置
									$('#rightside').scrollLeft(document.querySelector('.today').offsetLeft - $('#rightside').width()/2);
									
									
									$.each(task,function(i,item){
										
										function  DateDiff(sDate1,  sDate2){    //sDate1和sDate2是2006-12-18格式  计算相差天数
													       var  aDate,  oDate1,  oDate2,  iDays;  
													       aDate  =  sDate1.split("-");  
													       oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]); //转换为12-18-2006格式  
													       aDate  =  sDate2.split("-");  
													       oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]);  
													       iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24); //把相差的毫秒数转换为天数  
													       return  iDays;  
													   } 
										var data = new Date();
											if((parseInt(data.getMonth())+1)<10){ // 处理时间的格式
												if(data.getDate()<10){
													var nowtime = data.getFullYear() + '-0' + (parseInt(data.getMonth())+1) + '-0' + data.getDate();
												}else{
													var nowtime = data.getFullYear() + '-0' + (parseInt(data.getMonth())+1) + '-' + data.getDate();
												}
											}else{
												if(data.getDate()<10){
													var nowtime = data.getFullYear() + '-' + (parseInt(data.getMonth())+1) + '-0' + data.getDate();
												}else{
													var nowtime = data.getFullYear() + '-' + (parseInt(data.getMonth())+1) + '-' + data.getDate();
												}
											}
										if(item.tStatus==3 || item.tStatus==1 ){
												if(item.tStatus==1){
													$('#child_'+item.tId).find('.schedule').find('nobr').html(item.tSchedule+'%');
												}
											}else{
												
												if((new Date(nowtime).getTime()-new Date(item.tEndDate.replace(/\//g, '-')).getTime())>0){
													
													$('#taskbar_'+item.tId).find('.gcomplete').css('background-color', "#74BDFF");
													if(item.tStatus==2){
														$('#child_'+item.tId).find('.schedule').find('nobr').html(item.tSchedule+'%');
													}else{
														$('#child_'+item.tId).find('.schedule').find('nobr').html("0%");
													}
													$('#child_'+item.tId).find('.endData').find('nobr').html(item.tEndDate);
												}else{
													
													$('#taskbar_'+item.tId).find('.gcomplete').css('background-color', "#74BDFF");
												}
												
												
												
											}
										
										if(item.ChildTask.length > 0){
											
											$.each(item.ChildTask,function(j,childitem){
												if(childitem != undefined && childitem.ftId == item.tId){
													
													
													if(childitem.tStatus==3 || childitem.tStatus==1 ){ // 任务已完成状态 和进行时
														
														if(childitem.tStatus==1){
															$('#child_'+childitem.tId).find('.schedule').find('nobr').html(childitem.tSchedule+'%');
															//console.log(childitem.tSchedule +'1');
														}else{
															//console.log('2');
															$('#taskbar_'+childitem.tId).css('background-color','#1DA352');
															$('#child_'+childitem.tId).find('.schedule').find('nobr').html('100%');
															//console.log('#taskbar_'+childitem.tId);
														}
													
													}else{
														
														
														
														if((new Date(nowtime).getTime()-new Date(childitem.tEndDate.replace(/\//g, '-')).getTime())>0){
															//console.log('3');
															if(childitem.tStatus==2){
																$('#child_'+childitem.tId).find('.schedule').find('nobr').html(childitem.tSchedule+'%');
																//console.log(childitem.tSchedule);
															}else{
																$('#child_'+childitem.tId).find('.schedule').find('nobr').html("0%");
																//console.log('555555');
															}
															$('#child_'+childitem.tId).find('.endData').find('nobr').html(childitem.tEndDate);
															$('#taskbar_'+childitem.tId).find('.gcomplete').css('background-color', "#74BDFF");
														}else{
															//console.log('4');
															//console.log('#taskbar_'+childitem.tId);
															
														}
														
													}
												}
											});
										}
											
										
									});
									
									
									
								  }
								
								  else
								
								  {
								
								    alert("not defined");
								
								  }
							

							/*
								var task = d.ResultString.dataList;
								if(task.length == 0){
									$(".gantt_empty").show();
									return;
								}
								$(".gantt").show();
								var ganttData = [];
								var status = {0:"未开始",1:"进行中",2:"冻结",3:"已完成",4:"归档"};
								var color = {0:"ganttRed",1:"ganttRed",2:"ganttGreen",3:"ganttBlue",4:"ganttOrange"};
								$.each(task,function(i,item){
									var from = "/Date(" + item.tStartDate + ")/";
									var to = "/Date(" + item.tEndDate + ")/";
									ganttData.push({name:item.tName,desc:item.proposerName,values:[{from:from,to:to,label:status[item.tStatus],customClass:color[item.tStatus],dataObj:"123456"}]});
									if(item.ChildTask.length > 0){
										$.each(item.ChildTask,function(j,childitem){
											if(childitem != undefined && childitem.ftId == item.tId){
												var from = "/Date(" + childitem.tStartDate + ")/";
												var to = "/Date(" + childitem.tEndDate + ")/";
												ganttData.push({name:childitem.tName,desc:childitem.proposerName,values:[{from:from,to:to,label:status[childitem.tStatus],customClass:color[childitem.tStatus]}]});
												item.ChildTask.splice(j,1,undefined);
											}
										});
									}
								});
								$(".gantt").gantt({
									months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
									dow: ["日", "一", "二", "三", "四", "五", "六"],
									navigate: "scroll",
									waitText: "加载中",
									source: ganttData,
									navigate: "scroll",
									maxScale: "hours",
									itemsPerPage: 20,
									onItemClick: function(data) {
										//alert("Item clicked - show some details");
									},
									onAddClick: function(dt, rowId) {
										//alert("Empty space clicked - add an item!");
									},
									onRender: function() {
										if (window.console && typeof console.log === "function") {
											//console.log("chart rendered");
										}
									}
								});
								*/
								
								break;
							case "2":
								$(".gantt_empty").show();
						}
					});
					
					
					
					break;
				case "statistic"://统计
					break;
			}
			$('[original-title]').tipsy({
				fade: true,
				gravity: 'n'
			});
		});
		$(document).on("click", ".project_detail_operate_btn", function(e) {
			e.preventDefault();
			if ($(".btn-list").css("display") == "none") {
				var top = $(".project_detail_operate_btn").offset().top + 32;
				var left = $(".project_detail_operate_btn").offset().left - 35;
				$(".btn-list").css("top",top);
				$(".btn-list").css("left",left);
				$(".btn-list").show();
			} else {
				$(".btn-list").hide();
			}
		});
		$(document).on("focus", ".project_detail_title_type", function(e) {
			e.preventDefault();
			$(".project_detail_title .project_btn_group").slideDown(500);
		});
		$(document).on("click", ".project_detail_title .btn_blue", function(e) {//更新项目名称 确认
			e.preventDefault();
			var pName = $(".project_detail_title_type").val();
			if(projectInfo.pName == pName) return;
			projectInfo.pName = pName;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				projectJson: JSON.stringify(projectInfo),
				projectUserJson: JSON.stringify(ProjectUserList)
			}
			$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						$(".worklist_sidenav .active .name_wlsn").html(pName);
						$(".project_detail_title .project_btn_group").slideUp(500);
						break;
				}
			});
		});
		$(document).on("click", ".project_detail_title .btn_white", function(e) {//更新项目名称 取消
			e.preventDefault();
			$(".project_detail_title_type").val(projectInfo.pName);
			$(".project_detail_title .project_btn_group").slideUp(500);
		});
		$(document).on("focus", ".project_detail_progress_type", function(e) {
			$(".item_operate .project_btn_group").slideDown(500);
		});
		$(document).on("click", ".item_operate .btn_blue", function(e) {//修改项目进度，确认
			var value = parseInt($(".project_detail_progress_type").val().replace("%",""));
			if(projectInfo.progress == value) return;
			if(value > 0 && value <= 100){
				$(".progress_bar").css("width", value+"%");
				projectInfo.progress = value;
				var data = {
					token: localStorage.token,
					uid: userData.uId,
					projectJson: JSON.stringify(projectInfo),
					projectUserJson: JSON.stringify(ProjectUserList)
				}		
				$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
					var d = JSON.parse(result);
					switch (d.Result) {
						case "0":
							break;
						case "1":
							//alert("更新成功");
							$(".item_operate .project_btn_group").slideUp(500);
							break;
					}
				});
			}			
		});
		$(document).on("click", ".item_operate .btn_white", function(e) {//修改项目进度，取消
			$(".project_detail_progress_type").val(projectInfo.progress + "%");
			$(".item_operate .project_btn_group").slideUp(500);
		});
		$(document).on("click", ".project_detail_attr .show-more", function(e) {
			e.preventDefault();
			if ($(".project_detail_description").css("display") == "none") {
				$(".project_detail_description").show();
				$(".project_detail_top_responsible").show();
				$(".project_detail_top_visiable").show();
				$(".show-more").html('收起<span class="icon icon-arrow-up-double"></span>');
			} else {
				$(".project_detail_description").hide();
				$(".project_detail_top_responsible").hide();
				$(".project_detail_top_visiable").hide();
				$(".show-more").html('展开<span class="icon icon-arrow-down-double"></span>');
			}
		});
		$(document).on("focus", ".project_detail_description_type", function(e) {
			$(".project_detail_description .project_btn_group").slideDown(500);
		});
		$(document).on("click", ".project_detail_description .btn_blue", function(e) {//更新项目详情 确认
			var pDescription = $(".project_detail_description .input_container").val();
			if(projectInfo.pDescription == pDescription) return;
			projectInfo.pDescription = pDescription;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				projectJson: JSON.stringify(projectInfo),
				projectUserJson: JSON.stringify(ProjectUserList)
			}
			$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						$(".project_detail_description .project_btn_group").slideUp(500);
						break;
				}
			});
		});
		$(document).on("click", ".project_detail_description .btn_white", function(e) {//更新项目详情 取消
			$(".project_detail_description .input_container").val(projectInfo.pDescription);
			$(".project_detail_description .project_btn_group").slideUp(500);
		});
		$(document).on("click", ".btn-list li", function(e) {//更新项目状态
			if($(this).hasClass("delete_btn")) return;
			var that = this;
			var pStatus = $(that).attr("data-type");
			if(projectInfo.pStatus == pStatus) return;
			projectInfo.pStatus = pStatus;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				projectJson: JSON.stringify(projectInfo),
				projectUserJson: JSON.stringify(ProjectUserList)
			}
			$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						//alert("更新成功");
						$(".btn-list .active").removeClass("active");
						$(that).addClass("active");
						$(".btn-list").slideUp(500);
						break;
				}
			});
		});
		$(document).on("input", ".project_detail_attr .project_detail_priority", function(e){ //更新优先级
			var priority = $(".project_detail_attr .project_detail_priority").val();
			if(projectInfo.priority == priority) return;
			projectInfo.priority = priority;
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				projectJson: JSON.stringify(projectInfo),
				projectUserJson: JSON.stringify(ProjectUserList)
			}
			$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
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
		//time
		$(document).on("click", ".project_detail_time_edit", function(e) {
			e.preventDefault();
			var top = $(".project_detail_time_edit").offset().top + 27;
			var left = $(".project_detail_time_edit").offset().left;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","project_detail_time_edit")
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"));
		});
		$(document).on("click", ".range_inputs .cancelBtn", function(e){//时间框取消
			e.preventDefault();
			$(".tt-time-date-picker").hide();		
		});
		$(document).on("click", ".range_inputs .applyBtn", function(e){//时间框确认
			e.preventDefault();
			var type = $(".tt-time-date-picker").attr("data-type");
			switch(type){
				case "project_detail_time_edit"://更新项目起始时间
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");					
					if(projectInfo.pStartDate == startTime && projectInfo.pEndDate == endTime) return;
					projectInfo.pStartDate = startTime;
					projectInfo.pEndDate = endTime;
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						projectJson: JSON.stringify(projectInfo),
						projectUserJson: JSON.stringify(ProjectUserList)
					}
					$.post("/ProjectManage.aspx?method=EditProject",data).then(function(result){
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								//alert("更新成功");
								$(".project_detail_time_edit").attr("data-sdate",startTime);
								$(".project_detail_time_edit").attr("data-edate",endTime);
								$(".project_detail_time_edit .time_begin").html(startTime);
								$(".project_detail_time_edit .time_end").html(endTime);
								var days = common.getDateDiff(startTime,endTime);
								if(days >= 0){
									$(".time_expire .count").html(days);
									$(".time_expire").show();
								}else{
									$(".time_expire").hide();
								}								
								$(".tt-time-date-picker").hide();
								break;
						}
					});
					break;
				case "project_new_date":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");
					$(".project_input_container .project_date").attr("data-sdate",startTime);
					$(".project_input_container .project_date").attr("data-edate",endTime);
					$(".project_input_container .project_date").val(startTime + " 至 " + endTime);
					$(".tt-time-date-picker").hide();
					break;
				case "task-create-date-inner":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");
					$(".project_detail_content .task-create-date-inner").attr("data-sdate",startTime);
					$(".project_detail_content .task-create-date-inner").attr("data-edate",endTime);
					$(".project_detail_content .task-create-date-inner").attr("original-title",startTime + " 至 " + endTime);
					$(".tt-time-date-picker").hide();
					break;
				case "childtask-create-date-inner":
					var startTime = $(".startDatetime").attr("data-sdate");
					var endTime = $('.endDatetime').attr("data-edate");
					$(".task-detail-layout .task-create-date-inner").attr("data-sdate",startTime);
					$(".task-detail-layout .task-create-date-inner").attr("data-edate",endTime);
					$(".task-detail-layout .task-create-date-inner").attr("original-title",startTime + " 至 " + endTime);
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
		$(document).on("click", ".item_operate .deliver", function(e){
			e.preventDefault();
			$(".smember_container").show();
		});
		
		//新建项目
		/*$(".project_responsible .place_holder").on("click",function(e){
			e.preventDefault();
			var top = $(".project_responsible .place_holder").offset().top + 25;
			var left = $(".project_responsible .place_holder").offset().left;
			$(".smember_container").css("top",top);
			$(".smember_container").css("left",left);
			$(".smember_container").show();
		});*/
		$(".project_add_btn[data-name=add-apply-user]").on("click",function(e){//添加负责人
			e.preventDefault();
			var top = $(this).offset().top + 27;
			var left = $(this).offset().left;
			$(".smember_container_fzr").css("top", top);
			$(".smember_container_fzr").css("left", left);
			$(".smember_container_fzr").show();
			$(".smember_container_fzr").attr("data-type", "principal");
			$(".smember_container_cyr").hide();
			$(".smember_condition_input").val("");
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
						var uid = $(".principal_user_result").attr("data-uid");
						uid && $("input[value=" + uid + "]").attr("checked", "checked");
						searchUserlist = userlist;
						break;
				}
			});
		});
		$(".project_add_btn[data-name=add-project-member]").on("click",function(e){//添加参与人
			e.preventDefault();
			var top = $(this).offset().top + 27;
			var left = $(this).offset().left;
			$(".smember_container_cyr").css("top", top);
			$(".smember_container_cyr").css("left", left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type", "participant");
			$(".smember_container_fzr").hide();
			$(".smember_condition_input").val("");
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
							if(item.uId == parseInt($(".project_create .principal_user_result").attr("data-uid"))) return;
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
		});
		$(document).on("click", ".project_item_container .project_create_btn", function(e) {//新建项目确认
			e.preventDefault();
			var pName = $(".project_name_input").val();
			var pDescription = $(".project_description_input").val();
			var userjson = [{teamId:userData.teamId,pId:0,uId:userData.uId,uRole:1}];
			var principal_uid = $(".principal_user_result").attr("data-uid");
			principal_uid && userjson.push({teamId:userData.teamId,pId:0,uId:principal_uid,uRole:0});//负责人
			var participant_uid = $(".participant_user_result").attr("data-uid");
			if(!pName){
				layer.msg('请输入项目名称！',{time:2000});
				return;
			}
			if(!principal_uid){
				layer.msg('请选择项目负责人！',{time:2000});
				return;
			}
			if(!pDescription){
				layer.msg('请输入项目详情！',{time:2000});
				return;
			}
			if(participant_uid){
				participant_uid = JSON.parse(participant_uid);
				$.each(participant_uid,function(index,item){
					userjson.push({teamId:userData.teamId,pId:0,uId:item,uRole:2});//参与人
				});
			}
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				projectJson: JSON.stringify({
					teamId: userData.teamId,
					pName: pName,
					pDescription: pDescription,
					proPoser: userData.uId,
					pStartDate: $(".project_date").attr("data-sdate"),
					pEndDate: $(".project_date").attr("data-edate"),
					priority: $(".project_item_container .project_detail_priority").val(),
					progress: 0
				}),
				projectUserJson: JSON.stringify(userjson)
			}
			$.post("/ProjectManage.aspx?method=AddProject",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://成功
						location.reload();
						break;
					case "2":
						break;
				}
			});
			$(".project_create").show();
			$(".project_main_region").hide();
		});
		$(".project_cancel_btn").on("click", function(e) {//新建项目取消
			e.preventDefault();
			clearNewProject();
			$(".project_create").hide();
			$(".project_main_region").show();
		});
		$(".project_input_container .project_date").on("click",function(e){//起止时间
			e.preventDefault();
			var top = $(".project_input_container .project_date").offset().top + 40;
			var left = $(".project_input_container .project_date").offset().left;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","project_new_date");
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"));
		});
		//任务
		$(document).on("input",".tt-task-create .has-icon",function(e){
			e.preventDefault()
			if ($(this).val()) {
				$(".project_detail_content .btn-sure").removeClass("btn-disabled");
			} else {
				$(".project_detail_content .btn-sure").addClass("btn-disabled");
			}
		});
		$(document).on("click",".project_detail_content .task-create-principle-inner", function(e){		
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left - 100;
			$(".smember_container_fzr").css("top", top);
			$(".smember_container_fzr").css("left", left);
			$(".smember_container_fzr").show();
			$(".smember_container_fzr").attr("data-type", "principal_task");
			$(".smember_container_cyr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($("#project_detail_tab_container").attr("data-id"));
			searchUserlist = [];
			var tData = {
				pid: id,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/ProjectManage.aspx?method=GetProjectUser", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var userIds = [];
						var userlist = JSON.parse(d.ResultString);
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
						var uid = $(".project_detail_content .task-create-principle-inner").attr("data-uid");
						uid && $("input[value=" + uid + "]").attr("checked", "checked");
						break;
				}
			});
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
				case "principal": //项目负责人
					var uid = $("[name=principal_user]:checked").val();
					var name = $("[name=principal_user]:checked").attr("data-name");
					uid && $(".principal_user_result").attr("data-uid",uid);
					name && $(".principal_user_result").html(name);
					$(".smember_container").hide();
					break;
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
		$(document).on("click", ".project_detail_content .task-create-date-inner", function(e) {
			e.preventDefault();
			var top = $(".task-create-date-inner").offset().top + 35;
			var left = $(".task-create-date-inner").offset().left - 450;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","task-create-date-inner");
			var lsdate = $(".project_detail_time_edit .time_begin").html();
			var ledate = $(".project_detail_time_edit .time_end").html();
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"),lsdate,ledate);
		});
		$(document).on("click", ".project_detail_content .task-create-participator", function(e){//任务添加参与人
			e.preventDefault();
			if($(".project_detail_content .task-create-layout-extend").css("display") == "none"){
				$(".project_detail_content .task-create-layout-extend").show();
			}else{
				$(".project_detail_content .task-create-layout-extend").hide();
				$(".smember_container").hide();
			}
		});
		$(document).on("click", ".project_detail_content .ux_add_btn", function(e){
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left;
			$(".smember_container_cyr").css("top", top);
			$(".smember_container_cyr").css("left", left);
			$(".smember_container_cyr").show();
			$(".smember_container_cyr").attr("data-type", "participant_task");
			$(".smember_container_fzr").hide();
			$(".smember_condition_input").val("");
			var id = parseInt($("#project_detail_tab_container").attr("data-id"));
			var tData = {
				pid: id,
				uid: userData.uId,
				token: localStorage.token
			}
			$.post("/ProjectManage.aspx?method=GetProjectUser", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var userIds = [];
						var userlist = JSON.parse(d.ResultString);
						$(".smember_container_cyr .smember_list_parent").html("");
						var uid = $(".project_detail_content .participant_taskuser_result").attr("data-uid");
						uid && (uid = JSON.parse(uid));
						uid || (uid = []);
						$.each(userlist.dataList, function(index, item) {
							//if(item.uId == userData.uId) return;
							if($.inArray(item.uId,userIds) != -1) return;
							userIds.push(item.uId);
							searchUserlist.push(item);
							if(item.uId == parseInt($(".project_detail_content .task-create-principle-inner").attr("data-uid"))) return;
							var str = '<label><input name="participant_user" type="checkbox" value="' + item.uId + '" data-name="' + item.nickName + '"> <span class="select_user_head">'+item.nickName.substring(0,1)+'</span>' + item.nickName + ' </label>';
							if(uid.length != 0 && $.inArray(item.uId.toString(),uid) != -1){
								$(".smember_search_content_right .smember_list_parent").append(str);
							}else{
								$(".smember_search_content_left .smember_list_parent").append(str);
							}
						});
						/*var userlist = JSON.parse(d.ResultString);
						$(".smember_list_parent").html("");
						$.each(userlist,function(index,item){
							//if(item.uId == userData.uId) return;
							//if(item.uId == parseInt($(".project_detail_content .task-create-principle-inner").attr("data-uid"))) return;
							var str = '<label><input name="participant_user" type="checkbox" value="'+ item.uId + '" data-name="'+ item.nickName +'"> '+ item.nickName +' </label>';
							$(".smember_list_parent").append(str);
						});
						var uid = $(".project_detail_content .participant_taskuser_result").attr("data-uid")
						if(uid){
							uid = JSON.parse(uid);
							$.each(uid,function(index,item){
								$("input[value="+ item +"]").attr("checked","checked");
							});
						}*/					
						break;
				}
			});
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
				case "participant"://项目参与人
					var uid = [];
					var name = "";
					$.each($(".smember_search_content_right input[name=participant_user]"), function(index, item) {
						uid.push($(this).val());
						name += $(this).attr("data-name") + "、";
					});
					name = name.substring(0,name.length-1);
					uid && $(".participant_user_result").attr("data-uid",JSON.stringify(uid));
					$(".participant_user_result").html(name);
					$(".smember_container").hide();
					break;
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
				case "project_add_user"://添加成员 TODO	
					var pid = $("#project_detail_tab_container").attr("data-id");				
					var userArray = [];				
					$.each(ProjectUserList,function(index,item){
						if(item.uRole == 0 || item.uRole == 1){
							userArray.push(item)
						}
					});
					$.each($(".smember_search_content_right input[name=participant_user]"),function(index,item){
						var uid = $(this).val();
						userArray.push({teamId:userData.teamId,pId:projectInfo.pId,uId:uid,uRole:2});//参与人
					});
					console.log(userArray);	
					var data = {
						token: localStorage.token,
						uid: userData.uId,
						projectJson: JSON.stringify(projectInfo),
						projectUserJson: JSON.stringify(userArray)
					}
					$.post("/ProjectManage.aspx?method=EditProject", data).then(function(result) {
						var d = JSON.parse(result);
						switch (d.Result) {
							case "0":
								break;
							case "1":
								setProjectUser(pid);
								ProjectUserList = userArray;
								$(".smember_container_cyr").hide();
								//alert("更新成功");
						}
					});
					break;				
			}
		});
		$(document).on("click", ".smember_btn_default", function(e) { //添加参与人关闭
			e.preventDefault();
			$(".smember_container").hide();
		});
		$(document).on("click", ".project_detail_content .task-create-bottom .btn-sure", function(e){ //添加任务 确认
			e.preventDefault();
			var tName = $(".project_detail_content .ns-task-create-name .has-icon").val();
			var tDescribe = $(".project_detail_content .redactor_content").val();
			var principal_uid = $(".project_detail_content .task-create-principle-inner").attr("data-uid");//负责人id
			var tStartDate = $(".project_detail_content .task-create-date-inner").attr("data-sdate");
			var tEndDate = $(".project_detail_content .task-create-date-inner").attr("data-edate");
			var tPriority = $(".project_detail_content .task-create-tools-item .priority").val();
			var ftId = $("#project_detail_tab_container").attr("data-id");
			var ftType = 0;
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
			var participant_uid = $(".project_detail_content .participant_taskuser_result").attr("data-uid");
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
					tPriority: tPriority,
					tSchedule: 0,
					ftId: ftId,
					ftType: ftType
				}),
				taskUserJson: JSON.stringify(userjson)
			}
			$.post("/TaskManage.aspx?method=AddTask",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://成功
						//location.reload();
						setProjectTask(ftId);
						break;
					case "2":
						alert(d.Tip);
						break;
				}
			});
		});
		$(document).on("click", ".sort", function(e){ //任务排序
			e.preventDefault();
			if($(".ns-sortPop-dialog").css("display") == "none"){
				$(".ns-sortPop-dialog").show();
			}else{
				$(".ns-sortPop-dialog").hide();
			}		
		});
		$(document).on("click", ".mBar .item", function(e){
			e.preventDefault();
			$(".tipsy").remove();
			var flag = JSON.parse($(this).attr("data-sort"));//true:降序
			var activeValue = "default";
			var tip = "";
			$(".mBar .active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-name");
			var tasklist = ProjectTaskList;
			switch(type){
				case "default":					
					tasklist.sort(function(a,b){
						var aDate = new Date(a.createDate);
                    	var bDate = new Date(b.createDate);
                    	return (bDate - aDate);                		
					});
					break;
				case "start":
					tasklist.sort(function(a,b){
						var aDate = new Date(a.tStartDate);
                    	var bDate = new Date(b.tStartDate);
                    	if(flag){
                    		return (bDate - aDate);
                    	}else{
                    		return (aDate - bDate);
                    	}
					});
					flag ? tip="点击后最早开始的在前面" : tip="点击后最晚开始的在前面";
					activeValue = "start";
					break;
				case "end":
					tasklist.sort(function(a,b){
						var aDate = new Date(a.tEndDate);
                    	var bDate = new Date(b.tEndDate);
                    	if(flag){
                    		return (bDate - aDate);                		
                    	}else{
                    		return (aDate - bDate);                   		
                    	}
					});
					flag ? tip="点击后最早结束的在前面" : tip="点击后最晚结束的在前面";
					activeValue = "end";
					break;
				case "create":
					tasklist.sort(function(a,b){
						var aDate = new Date(a.createDate);
                    	var bDate = new Date(b.createDate);
                    	if(flag){
                    		return (bDate - aDate);                		
                    	}else{
                    		return (aDate - bDate);                   		
                    	}
					});
					flag ? tip="点击后最早创建的在前面" : tip="点击后最晚创建的在前面";
					activeValue = "create";
					break;
			}
			var data = {
				tasklist: tasklist
			};
			var render = _.template($("#project_task").html());
			var html = render(data);
			$(".project_detail_content").html(html);
			$(".mBar .active").removeClass("active");
			$(".item[data-name="+activeValue+"]").addClass("active");
			$(".item[data-name="+activeValue+"]").attr("data-sort", !flag);
			$(".item[data-name="+activeValue+"]").attr("original-title", tip);
			var startTime = common.GetDateStr(0);
			var endTime = common.GetDateStr(6);
			$(".task-create-date-inner").attr("data-sdate",startTime);
			$(".task-create-date-inner").attr("data-edate",endTime);
			$(".task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
			$('[original-title]').tipsy({fade: true, gravity: 'n'});
		});
		/*$(document).on("click",".status_ttpl",function(e){
			e.preventDefault();
			var tid= $(this).attr("data-id");
			if($(".tt_changestatusview").css("display") == "none"){
				var top = $(this).offset().top + 25;
				var left = $(this).offset().left - 45;
				$(".task-list-container .tt_changestatusview").css("top",top);
				$(".task-list-container .tt_changestatusview").css("left",left);
				$(".task-list-container .tt_changestatusview").show();
				$(".task-list-container .tt_changestatusview").attr("data-id",tid);
			}else{
				$(".tt_changestatusview").hide();
			}
		})*/
		$(document).on("click",".task-list-container .task-name",function(e){ //进入任务详情页
			e.preventDefault();
			var tid = $(this).attr("data-tid");
			setTaskDetails(tid);
		});
		$(document).on("click",".pull-screen-container .close-pull-screen",function(e){ //关闭任务详情页
			e.preventDefault();			
			$(".pull-screen-container").hide();
			var pid = $("#project_detail_tab_container").attr("data-id");
			setProjectTask(pid)		
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
						var pid = $("#project_detail_tab_container").attr("data-id");
						setProjectTask(pid);					
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
						var pid = $("#project_detail_tab_container").attr("data-id");
						setProjectTask(pid);					
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
						break;
				}
			});
		});
		$(document).on("mouseover", ".task-detail-layout .base-item[data-name=date-area]", function(e) { //更新任务起止日期
			e.preventDefault();
			var fzrid = parseInt($(".task-detail-layout .task-fzr-uid").attr("data-uid"));
			var uid = parseInt(userData.uId);
			if(fzrid == uid)
				$(".task-detail-layout .edit-button").show();
		});
		$(document).on("mouseout", ".task-detail-layout .base-item[data-name=date-area]", function(e) { //更新任务起止日期
			e.preventDefault();
			$(".task-detail-layout .edit-button").hide();
		});
		$(document).on("click", ".task-detail-layout .edit-button", function(e) { //更新任务起止日期
			e.preventDefault();
			var top = $(this).offset().top + 35;
			var left = $(this).offset().left - 200;
			$(".tt-time-date-picker").css("top",top);
			$(".tt-time-date-picker").css("left",left);
			$(".tt-time-date-picker").show();
			$(".tt-time-date-picker").attr("data-type","task-detail-date-inner");
			var type = parseInt($(".pull-screen-container").attr("data-fttype"));
			var lsdate = $(".task-detail-layout .set-task-date").attr("data-sdate");
			var ledate = $(".task-detail-layout .set-task-date").attr("data-edate");
			if(type == 2)
				common.datetimepicker(lsdate,ledate);
			else{
				
				common.datetimepicker(lsdate,ledate,lsdate,ledate);
			}
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
			searchUserlist = [];
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
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left;
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
			$(".tt-time-date-picker").attr("data-type","childtask-create-date-inner")
			var lsdate = $(".task-detail-layout .set-task-date").attr("data-sdate");
			var ledate = $(".task-detail-layout .set-task-date").attr("data-edate");
			common.datetimepicker($(this).attr("data-sdate"), $(this).attr("data-edate"),lsdate,ledate);
		});
		$(document).on("click", ".task-detail-layout .task-create-bottom .btn-sure", function(e){ //添加子任务 确认
			e.preventDefault();
			var tName = $(".task-detail-layout .ns-task-create-name .has-icon").val();
			var tDescribe = $(".task-detail-layout .redactor_content").val();
			var principal_uid = $(".task-detail-layout .task-create-principle-inner").attr("data-uid");//负责人id
			var tStartDate = $(".task-detail-layout .task-create-date-inner").attr("data-sdate");
			var tEndDate = $(".task-detail-layout .task-create-date-inner").attr("data-edate");
			var tPriority = $(".task-detail-layout .task-create-tools-item .priority").val();
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
					tPriority: tPriority,
					tSchedule: 0,
					ftId: ftId,
					ftType: ftType
				}),
				taskUserJson: JSON.stringify(userjson)
			}
			$.post("/TaskManage.aspx?method=AddTask",data).then(function(result){
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
		$(document).on("click",".packup",function(e){ //显示或隐藏子任务列表
			e.preventDefault();
			var id = $(this).attr("data-id");
			if($(this).hasClass("icon-minus")){//隐藏
				$(this).removeClass("icon-minus");
				$(this).addClass("icon-plus");
				$(".child-list-wraper[data-id="+id+"]").hide();
			}else{
				$(this).addClass("icon-minus");
				$(this).removeClass("icon-plus");
				$(".child-list-wraper[data-id="+id+"]").show();
			}
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
		$(document).on("click", ".project_list_tab li", function(e){
			$(".project_list_tab .active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-type");
			$(".project_list_panel").hide();
			$("."+type).show();
		});
		//user
		/*$(document).on("click", ".project_member_item_info .remove_response", function(e){
			e.preventDefault();
			var top = $(".project_member_item_info .remove_response").offset().top + 24;
			var left = $(".project_member_item_info .remove_response").offset().left;
			$(".smember_container").css("top",top);
			$(".smember_container").css("left",left);
			$(".smember_container").show();
		});*/
		$(document).on("click", ".project_member_add .member_add_big", function(e){ //添加项目成员
			e.preventDefault();
			var top = $(this).offset().top + 44;
			var left = $(this).offset().left - 100;
			$(".smember_container_cyr").css("top",top);
			$(".smember_container_cyr").css("left",left);
			$(".smember_container_cyr").show();
			$(".smember_container_fzr").hide();
			$(".smember_condition_input").val("");
			$(".smember_container").attr("data-type","project_add_user");
			var tData = {
				teamid: userData.teamId,
				uid: userData.uId,
				token: localStorage.token
			}
			searchUserlist = [];
			$.post("/UserManage.aspx?method=UserList", tData).then(function(result) {
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":
						break;
					case "1":
						var flag = true;
						var userIds = [];
						var userlist = JSON.parse(d.ResultString);						
						$(".smember_container_cyr .smember_list_parent").html("");
						var uid = [];
						var fzrid;
						$.each(ProjectUserList,function(index,item){
							if(item.uRole == 2)
								uid.push(parseInt(item.uId));
							else if(item.uRole == 0)
								fzrid = item.uId;
						});
						$.each(userlist, function(index, item) {
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
		});
		$(document).on("click",".btn-list .delete_btn",function(e){//删除项目
			e.preventDefault();
			var top = $(this).offset().top + 30;
			var left = $(this).offset().left - 150;
			$(".delete_project_dialog").css("top", top);
			$(".delete_project_dialog").css("left", left);
			$(".delete_project_dialog").show();
		});
		$(document).on("click",".delete_project_dialog .cancel_dialog",function(e){//删除项目 取消
			e.preventDefault();
			$(".delete_project_dialog").hide();
		});
		$(document).on("click",".delete_project_dialog .sure_dialog",function(e){//删除项目 确认
			e.preventDefault();
			var data = {
				token: localStorage.token,
				uid: userData.uId,
				pid: $("#project_detail_tab_container").attr("data-id")
			}
			$.post("/ProjectManage.aspx?method=DeleteProject",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						location.reload();
						break;
				}
			});
		});
		//动态相关
		dynamicImg = "";
		$(document).on("input",".addDynamic-writing",function(e){
			e.preventDefault();
			var value = $(".addDynamic-writing").val();
			$(".content_pm .num_pm").html(value.length)
			if(value){
				$(".tt_publishmblog .btn-sure").removeClass("btn-disabled");
			}else{
				$(".tt_publishmblog .btn-sure").addClass("btn-disabled");
			}
		});
		$(document).on("change",".upload_file_input",function(e){
			e.preventDefault();
			var formData = new FormData();
			formData.append("teamId", userData.teamId);
			formData.append("uid", userData.uId);
			formData.append("uId", userData.uId);
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
		$(document).on("click",".tt_publishmblog .btn-sure", function(e){ //新增动态
			e.preventDefault();
			var pid = $("#project_detail_tab_container").attr("data-id");
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
					relationId: pid,
					writing: writing,
					photo: dynamicImg,
					address: ""
				})
			}
			$.post("/DynamicManage.aspx?method=AddDynamic",data).then(function(result){
				var d = JSON.parse(result);
				switch (d.Result) {
					case "0":					
						break;
					case "1":
						setProjectFeed(pid);
						break;
				}
			})
		})
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
						var pid = $("#project_detail_tab_container").attr("data-id");
						setProjectFeed(pid)
						break;
				}
			})
		})
	}
	function clearNewProject(){
		$(".project_name_input").val("");
		$(".project_description_input").val("");
		$(".principal_user_result").html("");
		$(".principal_user_result").attr("data-uid","");
		$(".participant_user_result").html("");
		$(".participant_user_result").attr("data-uid","");
	}
	function getProjectInfo(pid){
		ProjectUserList = [];
		var udata = {
			token: localStorage.token,
			pid: pid,
			uid: userData.uId
		}
		$.post("/ProjectManage.aspx?method=GetProjectInfo",udata).then(function(result){
			var d = JSON.parse(result);
			switch (d.Result) {
				case "0":
					break;
				case "1":
					var ResultString = d.ResultString;
					if(!ResultString){
						layer.msg('您不是该项目的成员！',{time:2000});
						return;
					}
					var info = JSON.parse(ResultString);					
					projectInfo = info;
					data = {
						work: info
					}
					var render = _.template($("#project_detail").html());
					var html = render(data);
					$(".project_main_region").html(html);
					$.each(info.ProjectUser,function(index,item){
						if(item.uRole == "0"){
							$(".project_detail_top_responsible .item_value").html(item.nickName);
						}
						ProjectUserList.push({teamId:item.teamId,pId:pid,uId:item.uId,uRole:item.uRole});
					});	
					setProjectTask(pid);
					//获取成员信息，用于更新项目信息
					//getProjectUser(pid);
					//设置项目状态
					$(".project_detail_top_btn_creater li[data-type="+projectInfo.pStatus+"]").addClass("active");
					break;
			}
		});
	}
	function getProjectUser(pid){
		//获取成员信息，用于更新项目信息
		ProjectUserList = [];
		var udata = {
			token: localStorage.token,
			uid: userData.uId,
			pid: pid
		}
		$.post("/ProjectManage.aspx?method=GetProjectUser",udata).then(function(result){
			var d = JSON.parse(result);
			switch (d.Result) {
				case "0":
					break;
				case "1":
					var userlist = JSON.parse(d.ResultString).dataList;
					$.each(userlist,function(index,item){
						if(item.uRole == "0"){
							$(".project_detail_top_responsible .item_value").html(item.nickName);
						}
						ProjectUserList.push({teamId:item.teamId,pId:pid,uId:item.uId,uRole:item.uRole});
					});		
					break;
			}
		});
	}
	function setProjectFeed(pid){
		var data = {
			token: localStorage.token,
			uid: userData.uId,
			teamid: userData.teamId,
			pid: pid
		}
		$.post("/ProjectManage.aspx?method=GetShareByPid",data).then(function(result){
			var d = JSON.parse(result);
			switch (d.Result) {
				case "0":
					break;
				case "1":
					var feedlist = JSON.parse(d.ResultString).dataList;
					feedlist || (feedlist = []);
					var feeddata = {
						feedlist: feedlist
					};
					var render = _.template($("#project_feed").html());
					var html = render(feeddata);
					$(".project_detail_content").html(html);
					layer.photos({
				        photos: '.attachment_fb'
				    });
					break;
			}
		});
	}
	function setProjectTask(pid){
		var tData = {
			teamid: userData.teamId,
			uid: userData.uId,
			token: localStorage.token,
			ftId: pid
		}
		$.post("/ProjectManage.aspx?method=GetTaskByProject", tData).then(function(result){
			var d = JSON.parse(result);
			switch (d.Result) {
				case "0":
					break;
				case "1":
					var task = d.ResultString.dataList.reverse();
					ProjectTaskList = task;
					var data = {
						tasklist: task
					};
					var render = _.template($("#project_task").html());
					var html = render(data);
					$(".project_detail_content").html(html);
					$(".child-list-wraper").each(function(){$(this).find(".border-left:last").addClass("last")});
					var startTime = $(".project_detail_time_edit .time_begin").html();
					var endTime = $(".project_detail_time_edit .time_end").html();
					$(".project_detail_content .task-create-date-inner").attr("data-sdate",startTime);
					$(".project_detail_content .task-create-date-inner").attr("data-edate",endTime);
					$(".project_detail_content .task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
					$(".project_detail_content .task-create-applyuser-icon").html("发起人：" + userData.nickName);
					$(".project_detail_content  .task-create-principle-label").html(userData.nickName + "负责");
					$(".project_detail_content .task-create-principle-inner").attr("data-uid",userData.uId);
					$('[original-title]').tipsy({fade: true, gravity: 'n'});
					break;
				case "2":
					var data = {
						tasklist: []
					};
					var render = _.template($("#project_task").html());
					var html = render(data);
					$(".project_detail_content").html(html);
			}			
		});
	}
	function setProjectUser(pid){
		var udata = {
			token: localStorage.token,
			uid: userData.uId,
			pid: pid
		}
		$.post("/ProjectManage.aspx?method=GetProjectUser", udata).then(function(result) {
			var d = JSON.parse(result);
			switch (d.Result) {
				case "0":
					break;
				case "1":
					var userlist = JSON.parse(d.ResultString).dataList;
					var data = {
						userlist: userlist,
						num: userlist.length
					};
					var render = _.template($("#project_user").html());
					var html = render(data);
					$(".project_detail_content").html(html);
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
						uid: userData.uId,
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
					var startTime = taskdetail.tStartDate.substring(0,10);
					var endTime = taskdetail.tEndDate.substring(0,10);
					$(".task-detail-layout .task-create-date-inner").attr("data-sdate",startTime);
					$(".task-detail-layout .task-create-date-inner").attr("data-edate",endTime);
					$(".task-detail-layout .task-create-date-inner").attr("original-title","起止时间：" + startTime + "至" + endTime);
					$(".task-detail-layout .task-create-principle-label").html(userData.nickName + "负责");
					$(".task-detail-layout .task-create-principle-inner").attr("data-uid",userData.uId);
					$('[original-title]').tipsy({fade: true, gravity: 'n'});
				}					
		});
	}
	
	// 甘特图子任务的显示和隐藏
	var statu = 1;
	$(document).on('click', '.operate',function(){
		if(statu ===1){
			$(this).text('+');
			statu = 0;
		}else{
			$(this).text('-');
			statu = 1;
		}
	});
	
	
	
	
	
});