require.config({
    paths: {
        jquery: "jquery-2.1.4.min"
    },
    urlArgs: "v=2"//设置版本号
});
require(["jquery"],function($){
	var host = "http://mapi.emto.cn";
	$(function(){
		if ($(window).height() > 530 + 63) {
			var height = $(window).height() - 530;
			$("footer").css("margin-top", height)
		}
	});
	function setTip(tip){//错误提示
		var top = $(".forget-sure").offset().top - 40;
		var left = $(".forget-sure").offset().left;
		$(".errortext").css("top",top);
		$(".errortext").css("left",left);
		$(".errortext").html(tip);
		$(".errortext").show();
	}
	var wait = 60;
	function countdown(){
		if(wait == 0){
			$(".captcha_btn").on("click",captcha);
			$(".captcha_btn").val("验证码");
			$(".captcha_btn").removeClass("wait");
			wait = 60;
		}else {
			$(".captcha_btn").off("click");
			$(".captcha_btn").val(wait+"s");
			wait--;
			setTimeout(function(){
				countdown();
			},1000);
		}	
	}
	function captcha(e){
		e.preventDefault();
		var phone = $(".phone").val();
		if(!phone){
			setTip("请输入手机号");
			return;
		}
		var data = {
			phone: phone,
			enumType: 1
		}	
		$.post("/LoginManage.aspx?method=GetVerifyCode",data).then(function(result){
			var d = JSON.parse(result);
			if(d.Result == 1){
				$(".captcha_btn").off("click");
				$(".captcha_btn").addClass("wait");
				countdown();
			}				
		});
	}
	$(".captcha_btn").on("click",captcha);//获取验证码
	$(".forget-sure").on("click",function(e){ //下一步 验证验证码
		e.preventDefault();
		var phone = $(".phone").val();
		var verifyCode = $(".captcha_value").val();
		if(!phone){
			setTip("请输入手机号");
			return;
		}
		if(!verifyCode){
			setTip("请输入验证码");
			return;
		}
		var data = {
			phone: phone,
			verifyCode: verifyCode
		}	
		$.post("/LoginManage.aspx?method=CheckVerifyCode",data).then(function(result){
			var d = JSON.parse(result);
			if(d.Result == 1){
				userName = phone;
				$(".reset-area").show();
				$(".forget-area").hide();
			}				
		});
	});
	$(".reset-sure").on("click",function(e){
		e.preventDefault();
		var password1 = $(".password1").val();
		var password2 = $(".password2").val();
		if(!password1 || !password2){
			setTip("请输入新密码");
			return;
		}
		if(password1 != password2){
			setTip("两次输入的密码不一样");
			return;
		}
		var data = {
			userName: userName,
			password: password1
		};
		$.post("/LoginManage.aspx?method=RetrievePasswordReset",data).then(function(result){
			var d = JSON.parse(result);
			if(d.Result == 1){
				location.href = "./login.html";
			}				
		});
	})
});