var urlAPI 		= "https://secure.runrun.it/api/v1.0/";
var urlTasks	= '/tasks';
var urlUsers	= '/users/';
var urlUserStat	= '/user_statistics/';
var username 	= window.localStorage.getItem('username');
var menuApp 	= $('#menuApp');
var getUser;

var config 		= {
	auth 	: 0
}

$(document).ready(function(){

	/* Check Authenticate */
	function CheckAuth(){
		if(username === null){
			loadTemplate('#loadLogin');
		}
		else{
			config.auth = 1;
			loadTemplate('#loadTasks');	
		}
	}

	/* Do Login */
	function doLogin(){
		var username 	= $('#username');
		var labelError 	= $("#error");

		$.ajax({
			type: "GET",
			url: urlAPI + urlUsers + username.val(),
			beforeSend: function(){
				username.prop('disabled', true);
			},
			success: function(){
				window.localStorage.setItem('username', username.val());
				username.prop('disabled', true);
				config.auth = 1;
				loadTemplate('#loadTasks');
				console.log('Logged');
			},
			error: function(){
				labelError.html('Login Inválido!');
				username.prop('disabled', false);
				console.log('Error Logged');
			}
		});
	}

	/* User Informations */
	var getUser = (function(){

		var username = window.localStorage.getItem('username');
		var callback;
		var dados;

		function getDados(){
			$.ajax({
				type: "GET",
				url: urlAPI + urlUsers + username,
				beforeSend: function(){

				},
				success: function(response){
					dados = response;
					if(typeof callback === 'function') callback();
				},
				error: function(){

				}
			});
		}

		return {
			responseCallback : function(fn){
				callback = fn;
			},

			getDados : function(){
				getDados();
			},

			get profile(){
				return dados;
			}
		}

	})();

	/* List of Tasks of the User Logged */
	function listTasks(){
		var ulContent 	= $('#list-tasks');
		var username 	= getUser.profile.id;

		$.ajax({
			type: "GET",
			url: urlAPI + urlTasks + '?responsible_id=' + username,
			beforeSend: function(){
				ulContent.html('<p align="center"><img src="img/ripple.gif" height="30"></p>');
			},
			success: function(response){
				ulContent.html('');
				$.each(response, function(i,v){
					if(v.project_name.length > 30) project_name = v.project_name.substring(0, 30);

					if(v.is_working_on){
						ulContent.append('<li data-id-project="'+v.id+'"> \
										 	<i class="fa fa-pause pauseTask"></i> \
											<div class="info"> \
												<a href="javascript: void(0)" class="showTask">' + project_name + '<a/> \
												<div>' +v.client_name+ '</div> \
											</div> \
										 </li>');
					}
					else{
						ulContent.append('<li data-id-project="'+v.id+'"> \
										 	<i class="fa fa-play playTask"></i> \
										 	<div class="info"> \
												<a href="javascript: void(0)" class="showTask">' + project_name + '<a/> \
												<div>' +v.client_name+ '</div> \
											</div> \
										 </li>');
					}
					console.log('List Tasks');
				});
			}
		});
	}

	/* Load Template */
	function loadTemplate(section){
		$('.sectionTemplate').removeClass('active');
		$(section).addClass('active');

		if(config.auth == 1){
			menuApp.addClass('active');
			getUser.responseCallback(listTasks);
			getUser.getDados();
		}			
	}

	/* Play in Task */
	function playTask(){
		var el 	   = $(this);
		var idTask = $(this).parent().data('id-project');

		$.ajax({
			type: "POST",
			url: urlAPI + urlTasks + '/' + idTask + '/play',
			beforeSend: function(){
				
			},
			success: function(response){
				console.log('Task Play');
				el.removeClass('fa-play playTask').addClass('fa-pause pauseTask');
			},
			error: function(){
				console.log('Error Task Play');
			}
		});
	}

	/* Pause in Task */
	function pauseTask(){
		var el 	   = $(this);
		var idTask = $(this).parent().data('id-project');

		$.ajax({
			type: "POST",
			url: urlAPI + urlTasks + '/' + idTask + '/pause',
			beforeSend: function(){
				
			},
			success: function(response){
				console.log('Task Pause');
				el.removeClass('fa-pause pauseTask').addClass('fa-play playTask');
			},
			error: function(){
				console.log('Error Task Pause');
			}
		});
	}

	/* Load Information And Stats of User */
	function loadStatUser(){
		var username 		= getUser.profile.id;
		var name 			= getUser.profile.name;
		var imageProfile 	= getUser.profile.avatar_large_url;

		/* Load Image Profile */
		$('#loadStat > .infos > .image').html('<img src="'+imageProfile+'">');
		$('#loadStat > .infos > .name').html(name);

		$.ajax({
			type: "GET",
			url: urlAPI + urlUserStat + username,
			beforeSend: function(){
				
			},
			success: function(response){
				console.log('Load User Stat');
				$('.value').html(response.total);
			},
			error: function(){
				console.log('Error Load User Stat');
			}
		});
	}

	function showSection(){
		var idSection = $(this).attr('id');
		$('.showSection').removeClass('active');
		$(this).addClass('active');

		$('.sectionTemplate').removeClass('active');
		$(idSection).addClass('active');

		console.log(idSection);
		if(idSection == '#loadStat'){
			loadStatUser();
		}
	}

	CheckAuth();

	$('#doLogin').on('click', doLogin);
	$(document).on('click', '.playTask', playTask);
	$(document).on('click', '.pauseTask', pauseTask);
	$(document).on('click', '.showSection', showSection);

});