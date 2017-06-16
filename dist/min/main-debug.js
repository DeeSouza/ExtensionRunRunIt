var urlAPI 		= "https://secure.runrun.it/api/v1.0";
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
			config.auth = 0;
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
				window.localStorage.setItem('username', username.val());
			},
			success: function(){
				username.prop('disabled', true);
				config.auth = 1;
				loadTemplate('#loadTasks');
				console.log('Logged');
			},
			error: function(){
				labelError.html('Login Inválido!');
				username.prop('disabled', false);
				window.localStorage.removeItem('username');
				loadTemplate('#loadLogin');
				console.log('Error Logged');
			}
		});
	}

	/* User Informations */
	var getUser = (function(){

		var callback;
		var dados;

		function getDados(){
			$.ajax({
				type: "GET",
				url: urlAPI + urlUsers + window.localStorage.getItem('username'),
				beforeSend: function(){
				},
				success: function(response){
					dados = response;
					if(typeof callback === 'function') callback();
				},
				error: function(){
					config.auth = 0;
					loadTemplate('#loadLogin');
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

	/* Format Seconds to Hours */
	function formatTime(seconds){
		return (seconds / 3600).toFixed(2).replace('.', ':') + 'Hs';
	}

	/* Format Date */
	function formatDate(date){
		var monthNumber = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

		var day 		= (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
		var monthIndex 	= date.getMonth();
		var year 		= date.getFullYear();

		return day + '/' + monthNumber[monthIndex] + '/' + year;
	}

	/* States Tasks */
	function showNameState(state){
		var status		= {
			queued 		: 'Na Fila',
			working_on 	: 'Trabalhando'
		}
		return status[state];
	}

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
					title 		 = v.title;
					project_name = v.project_name;

					var inf = {
						clientName	: v.client_name,
						id			: v.id,
						projectName	: v.project_name,
						teamName	: v.team_name,
						title		: v.title,
						typeName	: v.type_name,
						prog 		: v.time_progress,
						creator 	: v.user_name,
						responsible : v.responsible_name,
						createdAt	: formatDate(new Date(v.created_at)),
						startDate	: formatDate(new Date(v.start_date)),
						typeTask 	: v.type_name,
						stateTask 	: showNameState(v.state),
						timeWorked 	: formatTime(v.time_worked),
						timePending : formatTime(v.time_pending),
						timeTotal 	: formatTime(v.time_total),
						attachCount	: v.attachments_count
					};

					if(v.title.length > 25)
						title = v.title;

					if(v.project_name.length > 25)
						project_name = v.project_name;

					if(v.is_working_on){
						ulContent.append(`<li data-id-task="${v.id}" class="showTask">
										 	<i class="fa fa-pause pauseTask"></i>
											<div class="info">
												<a href="javascript: void(0)" class="title truncate" title="${v.title}">${title}</a>
												<a href="javascript: void(0)" class="project truncate" title="${v.project_name}">${project_name}</a>
												<div class="client">${v.client_name}</div>
												<a href="https://secure.runrun.it/tasks/${v.id}" class="externalLink" target="_blank"><i class="fa fa-external-link"></i></a>
											</div>
										 </li>`).children(`li[data-id-task=${v.id}]`).data("info", inf);
					}else{
						ulContent.append(`<li data-id-task="${v.id}" class="showTask">
										 	<i class="fa fa-play playTask"></i>
											<div class="showTask info">
												<a href="javascript: void(0)" class="title truncate" title="${v.title}">${title}</a>
												<a href="javascript: void(0)" class="project truncate" title="${v.project_name}">${project_name}</a>
												<div class="client">${v.client_name}</div>
												<a href="https://secure.runrun.it/tasks/${v.id}" class="externalLink" target="_blank"><i class="fa fa-external-link"></i></a>
											</div>
										 </li>`).children(`li[data-id-task=${v.id}]`).data("info",inf);
					}

					console.log('List Tasks');
				});
			}
		});

		/* Click in X and Clear Input Search */
		$(document).on('click', '.search-wrapper > i.fa-times', function () {
			$('input#search').val('');
			$('.search-wrapper').find('i').removeClass('fa-times').addClass('fa-search');
			$('#list-tasks li').show();
		});

		/* Search Tasks */
		$('input#search').on('keyup', function(event){
			var t = this;
			$('.search-wrapper').find('i').removeClass('fa-search').addClass('fa-times');
			$('#list-tasks li').each(function(i,e){
				if($(t).val() != ""){
					if($(this).text().toLowerCase().indexOf($(t).val().toLowerCase()) > -1){
						$(this).show();
					}else{
						$(this).hide();
					}
				}else{
					$(this).show();
				}
			});
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
		else{
			menuApp.removeClass('active');
		}
	}

	/* Play in Task */
	function playTask(event){
		event.stopPropagation();
		var el 	   = $(this);
		var idTask = $(this).parent().data('id-task');

		$.ajax({
			type: "POST",
			url: urlAPI + urlTasks + '/' + idTask + '/play',
			beforeSend: function(){
				el.removeClass('fa-play playTask').addClass('fa-clock-o');
			},
			success: function(response){
				console.log('Task Play');
				el.removeClass('fa-play playTask fa-clock-o').addClass('fa-pause pauseTask');
			},
			error: function(){
				console.log('Error Task Play');
			}
		});
	}

	/* Pause in Task */
	function pauseTask(event){
		event.stopPropagation();
		var el 	   = $(this);
		var idTask = $(this).parent().data('id-task');

		$.ajax({
			type: "POST",
			url: urlAPI + urlTasks + '/' + idTask + '/pause',
			beforeSend: function(){
				el.removeClass('fa-pause pauseTask').addClass('fa-clock-o');
			},
			success: function(response){
				console.log('Task Pause');
				el.removeClass('fa-pause pauseTask fa-clock-o').addClass('fa-play playTask');
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

	/* Delivers current Task */
	function deliverTask(){
		if($('.detail-task').hasClass('off-screen')){
			// do nothing
		}else{
			$('.detail-task').addClass('off-screen');
			$('.alert').addClass('active');
		}

		function cancealingDelivery(){
			if($('.detail-task').hasClass('off-screen')){
				$('.detail-task').removeClass('off-screen');
				$('.alert').removeClass('active');
			}
		}

		function deliver(){
			var info = $(this).data('info');
			var _url = urlAPI + urlTasks + '/' + info.id + '/close';

			$.ajax({
				type: "POST",
				url: _url,
				beforeSend: function(){
					$('button.deliver').html('<i class="fa fa-circle-o-notch fa-spin"></i>').prop('disabled', true);
				},
				success: function(response){
					$('#tasks').removeClass('active');
					$('.detail-task').removeClass('active');
					$('.alert').removeClass('active');
					listTasks();
				},
				error: function(){
					$('button.deliver').html('<i class="fa fa-paper-plane"></i> ENTREGAR').prop('disabled', false);
				}
			});
		}

		$('.alert button.deliver').click(deliver);
		$('.alert button.cancel').click(cancealingDelivery);
	}

	/* Show Description From Task */
	function showTask(event){
		event.stopPropagation();

		$('.tabIntern').addClass('hide');
		$('.description').removeClass('hide');

		$('#list-tasks > li').removeClass('selected');

		var idTask 	= $(this).closest('li').data('id-task');
		var info 	= $(this).closest('li').data('info');

		$(this).closest('li').addClass('selected');
		$('.alert button.deliver').data('info',info);

		$('.detail-task > .task-title').text(info.id + " - " + info.title);

		$('.detail-task > div.progress-bar').attr('title', Math.round(info.prog) + "%");
		$('.detail-task > div.progress-bar > div.fill').css({
			width : ((info.prog >= 100) ? 100 : info.prog) + "%",
		});

		$('.detail-task > div.progress-bar > div.fill').removeClass('ok');
		$('.detail-task > div.progress-bar > div.fill').removeClass('past60');
		$('.detail-task > div.progress-bar > div.fill').removeClass('late');

		if(info.prog < 60){
			$('.detail-task > div.progress-bar > div.fill').addClass('ok');
		}
		else if(info.prog >= 60 && info.prog < 90){
			$('.detail-task > div.progress-bar > div.fill').addClass('past60');
		}
		else{
			$('.detail-task > div.progress-bar > div.fill').addClass('late');
		}

		$('.detail-task > .task-title').attr("title",info.id + " - " + info.title);
		$('.detail-task > .project-name').text(info.projectName);

		$('.detail-task > .project-name').attr("title", info.projectName);
		$('.detail-task > .client-name').text(info.clientName);
		$('.detail-task > .client-name').attr("title", info.clientName);

		$('.detail-task > .details > .creator > div').text(info.creator);
		$('.detail-task > .details > .responsible > div').text(info.responsible);
		$('.detail-task > .details > .created_at > div').text(info.createdAt);
		$('.detail-task > .details > .start_date > div').text(info.startDate);
		$('.detail-task > .details > .type > div').text(info.typeTask);
		$('.detail-task > .details > .state > div').text(info.stateTask);
		$('.detail-task > .details > .time_worked > div').text(info.timeWorked);
		$('.detail-task > .details > .time_pending > div').text(info.timePending);
		$('.detail-task > .details > .time_total > div').text(info.timeTotal);
		$('.detail-task > .details > .attach_count > div').text(info.attachCount);

		$.ajax({
			type: "GET",
			url: urlAPI + urlTasks + '/' + idTask + '/description',
			beforeSend: function(){

			},
			success: function(response){
				console.log('Load Description Task');
				$('#tasks, .detail-task').addClass('active');
				$('.detail-task > .description').html(response.description);
			},
			error: function(){
				console.log('Error Load Description Task');
			}
		});

		$.ajax({
			type: "GET",
			url: urlAPI + urlTasks + '/' + idTask + '/documents',
			beforeSend: function(){
				$('.detail-task > .attachments > ul').html('');
			},
			success: function(response){
				console.log('Load Attachments Task');
				$('#tasks, .detail-task').addClass('active');
				$.each(response, function(i,v){
					$('.detail-task > .attachments > ul').append('<li>' + v.data_file_name + '</li>');
				});
			},
			error: function(){
				console.log('Error Load Attachments Task');
			}
		});
	}

	function backTasks(){
		$('#tasks, .detail-task').removeClass('active');
	}

	/* Show Page */
	function showSection(){
		var idSection = $(this).attr('id');
		$('.showSection').removeClass('active');
		$(this).addClass('active');

		$('.sectionTemplate').removeClass('active');
		$(idSection).addClass('active');

		if(idSection == '#loadStat'){
			loadStatUser();
		}
	}

	/* Show Intern Task Description And Attachments */
	function internTask(){
		var idTab = $(this).attr('href')
		$('.tabIntern').addClass('hide');
		$(idTab).removeClass('hide');
	}

	/* Show Menu Options */
	$('.open-options').on('click', function(){
		$('.menuOptions').toggleClass('active');
	});

	/* Click Outside Menu Options */
	$('body').on('click', function(event){
		var targetClick = event.target;
		if(!$(targetClick).closest('a').hasClass('open-options') && !$(targetClick).closest('ul').hasClass('menuOptions')){
			$('.menuOptions').removeClass('active');
		}
	});

	CheckAuth();

	$('#doLogin').on('click', doLogin);
	$(document).on('click', '.playTask', playTask);
	$(document).on('click', '.pauseTask', pauseTask);
	$(document).on('click', '.showSection', showSection);
	$(document).on('click', '.showTask', showTask);
	$(document).on('click', '.backTasks', backTasks);
	$(document).on('click', '.showInternTask', internTask);
	$(document).on('click', '.deliver', deliverTask);

});
