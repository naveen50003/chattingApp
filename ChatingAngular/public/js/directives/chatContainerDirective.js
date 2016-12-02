angular
	.module('chatApp')
	.directive('chatContainerDir',function(){
		return {
			replace:"true",
			template:`
					<div class='chatRoom' id='"+user+"Room'>
						<p class='chatUser' id='"+user+"Name'>"+user+"</p>
						<div class ='chatMsg' id='"+user+"'></div>
					</div>
					`
		}
	})