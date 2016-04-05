require.config({
    paths: {
        jquery: "jquery-2.1.4.min"
    },
    waitSeconds: 0,
    urlArgs: "v=1"//设置版本号
});
require(["jquery"],function($){
	var host = "http://mapi.emto.cn";
	var indexUrl = "./index.html";
	$(function(){
		if(localStorage.autologin == "1"){
			var data = {
				userName: localStorage.username,
				token: localStorage.token
			}
			$.post("/LoginManage.aspx?method=TokenLogin",data).then(function(result){
				var d = JSON.parse(result);
				switch(d.Result){
					case "0": 
						break;
					case "1"://登录成功
						location.href = indexUrl;
						break;
					case "2":
						break;
				}
			});
		}
		$(".autologin").on("click", function(e) {
			e.preventDefault();
			if ($(this).hasClass("no-checked")) {
				$(this).removeClass("no-checked");
			} else {
				$(this).addClass("no-checked");
			}
		});
		//$(".main").css("height",$(window).height());
		if ($(window).height() > 610 + 63) {
			var height = $(window).height() - 610;
			$("footer").css("margin-top", height)
		}
		$(".login-sure").on("click",function(e){
			e.preventDefault();
			var phone = $(".phone").val();
			var password = $(".password").val();
			if(!phone){
				setTip("账号不能为空");
				return;
			}
			if(!password){
				setTip("密码不能为空");
				return;
			}
			var data = {
				userName: phone,
				password: password
			}
			$.post("/LoginManage.aspx?method=UserLogin",data).then(function(result){
				console.log(result);
				var d = JSON.parse(result);
				console.log(d);
				switch(d.Result){
					case "0": 
						setTip(d.Tip);
						break;
					case "1"://登录成功
						var token = d.ResultString;
						localStorage.token = token;
						localStorage.username = phone;
						if($(".autologin").hasClass("no-checked")){
							localStorage.autologin = 0;
						}else{
							localStorage.autologin = 1;
						}
						location.href = indexUrl;
						break;
					case "2":
						setTip(d.Tip);
						break;
				}
			});
		});
		$(document).on("keydown",function(e){
			if (event.keyCode == 13) {
				var phone = $(".phone").val();
				var password = $(".password").val();
				if(phone && password){
					$(".login-sure").click();
					return false;
				}			
			}
		});
	});
	function setTip(tip){//错误提示
		var top = $(".login-sure").offset().top - 40;
		var left = $(".login-sure").offset().left;
		$(".errortext").css("top",top);
		$(".errortext").css("left",left);
		$(".errortext").html(tip);
		$(".errortext").show();
	}
});