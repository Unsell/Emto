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
require(["jquery","common","tipsy","datetimepicker","underscore"],function($,common){
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
                        common.logout();
                        callback();
                        break;
                    case "2":
                        break;
                }
            });     
        }else{
            location.href = common.same.loginUrl;
        }
    });
    function callback(){
        $('[original-title]').tipsy({fade: true, gravity: 'n'});
        //初始化头部内容
        $(".radius_img30").html(userData.nickName.substring(0,1));
        $(".name_tthn").html(userData.nickName);
        $(".brand").html(userData.teamShortName);
        var startTime = common.GetDateStr(0);
        var endTime = common.GetDateStr(30);
        $(".report_content .input-default").attr("data-sdate", startTime);
        $(".report_content .input-default").attr("data-edate", endTime);
        $(".report_content .input-default").html(startTime + "至" + endTime);
        //起止时间
        $(document).on("click", ".report_content .input-default", function(e) {
            e.preventDefault();
            var top = $(this).offset().top + 35;
            var left = $(this).offset().left;
            $(".tt-time-date-picker").css("top",top);
            $(".tt-time-date-picker").css("left",left);
            $(".tt-time-date-picker").show();
            $(".tt-time-date-picker").attr("data-type","report-usersign-me");
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
                case "report-usersign-me":
                    var startTime = $(".startDatetime").attr("data-sdate");
                    var endTime = $('.endDatetime').attr("data-edate");
                    $(".report_content .input-default").attr("data-sdate", startTime);
                    $(".report_content .input-default").attr("data-edate", endTime);
                    $(".report_content .input-default").html(startTime + "至" + endTime);
                    $(".tt-time-date-picker").hide();
                    break;                
            }           
        });
        $(document).on("click", ".report_content .btn-sure", function(e){//签到统计确认
            e.preventDefault();
            var type = $("._tt_side_subnav li.active a").attr("data-type");
            var beginDate = $(".report_content .input-default").attr("data-sdate");
            var endDate = $(".report_content .input-default").attr("data-edate");
            switch(type){
                case "me":
                    var data = {
                        token: localStorage.token,
                        uid: userData.uId,
                        teamid: userData.teamId,
                        beginDate: beginDate,
                        endDate: endDate
                    };
                    $.post("/SignManage.aspx?method=GetUserSign",data).then(function(result){
                        var d = JSON.parse(result);
                        switch (d.Result) {
                            case "0":
                                break;
                            case "1":
                                var data = {
                                    list: d.ResultString.dataList
                                };
                                var render = _.template($("#report_usersign").html());
                                var html = render(data);
                                $(".report_chart_container").html(html);
                                break;
                            case "2":
                                var data = {
                                    list: []
                                };
                                var render = _.template($("#report_usersign").html());
                                var html = render(data);
                                $(".report_chart_container").html(html);
                                break;
                        }
                    });
                    break;
                case "team":
                    var data = {
                        token: localStorage.token,
                        uid: userData.uId,
                        teamid: userData.teamId,
                        beginDate: beginDate,
                        endDate: endDate
                    };
                    $.post("/SignManage.aspx?method=GetTeamSign",data).then(function(result){
                        var d = JSON.parse(result);
                        switch (d.Result) {
                            case "0":
                                break;
                            case "1":
                                var data = {
                                    list: d.ResultString.dataList
                                };
                                var render = _.template($("#report_usersign").html());
                                var html = render(data);
                                $(".report_chart_container").html(html);
                                break;
                            case "2":
                                var data = {
                                    list: []
                                };
                                var render = _.template($("#report_usersign").html());
                                var html = render(data);
                                $(".report_chart_container").html(html);
                                break;
                        }
                    });
                    break;
            }           
        });
        $(document).on("click", "._tt_side_subnav li", function(e){
            e.preventDefault();
            if($(this).hasClass("active")) return;
            $("._tt_side_subnav li.active").removeClass("active");
            $(this).addClass("active");
            $(".report_chart_container").html("");
        });
    }
});