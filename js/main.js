var urlAPI 		= "https://secure.runrun.it/api/v1.0/";
var tasks  		= '/tasks/';
var users 		= '/users'
var username 	= window.localStorage.getItem('username');
var menuApp 	= $('#menuApp');

var config 		= {
	auth 	: 0
}

$(document).ready(function(){

	function Auth(){
		if(username === null){
			loadTemplate('#loadLogin');
		}
		else{
			config.auth = 1;
			loadTemplate('#loadTasks');	
		}
	}

	function doLogin(){
		var username 	= $('#username');
		var labelError 	= $("#error");

		$.ajax({
			type: "GET",
			url: urlAPI + users + '/' + username.val(),
			beforeSend: function(){
				username.prop('disabled', true);
			},
			success: function(){
				window.localStorage.setItem('username', username.val());
				username.prop('disabled', true);
				config.auth = 1;
				loadTemplate('#loadTasks');
			},
			error: function(){
				labelError.html('Login Inválido!');
				username.prop('disabled', false);
			}
		});
	}

	function getUser(){
		return window.localStorage.getItem('username');
	}

	function listTasks(){
		var ulContent 	= $('#list-tasks');
		var username 	= getUser();

		$.ajax({
			type: "GET",
			url: urlAPI + tasks + '?responsible_id=' + username,
			beforeSend: function(){
				ulContent.html('<p align="center"><img src="img/ripple.gif" height="30"></p>');
			},
			success: function(response){
				ulContent.html('');
				$.each(response, function(i,v){
					if(v.project_name.length > 30) project_name = v.project_name.substring(0, 30);
					ulContent.append('<li> \
									 	<i class="fa fa-play"></i> \
										<a href="javascript: void(0)">' + project_name + '<a/> \
									 </li>');
				});
			}
		});
	}

	function loadTemplate(section){
		$('.sectionTemplate').removeClass('active');
		$(section).addClass('active');

		if(config.auth == 1){
			menuApp.addClass('active');
			listTasks();
		}			
	}

	Auth();

	$('#doLogin').on('click', doLogin);

});