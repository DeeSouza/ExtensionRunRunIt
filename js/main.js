var urlAPI = "https://secure.runrun.it/api/v1.0/";
var tasks  = '/tasks/';

$(document).ready(function(){

	function listTasks(){
		var ulContent = $('#list-tasks');
		$.ajax({
			type: "GET",
			url: urlAPI + tasks + '?responsible_id=[user]',
			beforeSend: function(){
				ulContent.html('<p align="center"><img src="img/ripple.gif" height="30"></p>');
			},
			success: function(response){
				ulContent.html('');
				$.each(response, function(i,v){
					if(v.project_name.length > 30) project_name = v.project_name.substring(0, 30);
					ulContent.append('<li>' + project_name + '</li>');
					ulContent.append('<li>' + project_name + '</li>');
					ulContent.append('<li>' + project_name + '</li>');
				});
			}
		});
	}

	listTasks();

});