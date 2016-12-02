angular.module("chatApp",[])
		.controller('chatController',['$scope','$compile','$timeout','$http',function($scope,$compile,$timeout,$http){
			console.log("entered chat controller");
			
			var socket	= io.connect();
			$scope.showChatContainer	=	false;
			// $scope.loginUser	=	"navaneeth";
			$scope.loginContainer	=	true;
			//$scope.userName='';
			var temp = 0,
			 	msgEle,
				id,
				msgAppend,user;
			var roomUsers	=	[];
			$scope.submitClick	=	function(){
				
				$scope.userName	=	angular.element('#nickname')[0].value;
				// $scope.createChatRoom($scope.userName);
				// $scope.users	=	['nava1','nava2','nava3','nava4'];
				socket.emit('new user',$scope.userName,function(data){
					console.log(data);
					if(data){
						if( data === "user Exists")
							alert("user already exists ...try again");
						else{
							
						}
					}else{
						// $nickError.html("user already exists ...try again");
						
					}
				})
				socket.on('usernames',function(data){
					// var logInx	=	{
					// 	login:	$scope.userName,
					// 	status	:	"online"
					// }
					var logInx
					for(var i=0;i<=data.length-1;i++){
						if(data[i].login	===	$scope.userName){
							
							logInx	=	data[i];
						}
					}
					if(angular.isObject(logInx))
						{
							// console.log("loginx is Object");
							logInx	=	data.indexOf(logInx);
							data.splice(logInx,1);
						}
					if(data.length>=1){
							console.log("new user entered");
							$scope.$apply(function(){
								
								$scope.users	= data;
								$scope.showChatContainer	=	true;
								$scope.loginContainer	=	false;
							})
						}else{
							$scope.showChatContainer	=	true;
							$scope.loginContainer	=	false;
						}
				})
			}
			$scope.createChatRoom	=	function(user){
				
				console.log("entered create chat room");
				if(roomUsers.indexOf(user) == -1){
					
					roomUsers.push(user);
					var elm	=	angular.element("<div class='chatRoom' id='"+user+"Room'><p class='chatUser'>"+user+"</p><div class ='chatMsg' id='"+user+"Box'></div></div>");
					var statusDiv	=	$compile(angular.element("<div ng-if='statusShow'><p id='"+user+"status'>{{status}}</p></div>"))($scope);
					var formElem	=	$compile(angular.element("<form id='send-message'>\
												<input size='26' id='message' ng-keyup='msgTyping($event)'/>\
												<input type='submit'  id='"+user+"' ng-click='sendMessage($event)'/>\
												<div class='browseImgCOntainer'><input type='file' value='Browse' name='imageDis'\
												onchange='angular.element(this).scope().upload(this)'/>\
												</div>\
												</form>"))($scope);
												// ng-click='upload($event)' /></form>"))($scope);
												// ng-click='upload()' /></form>"))($scope);
												// </form>"))($scope);
												
					angular.element('.chatClub').append(elm);
					id = user+"Room"; 
					angular.element('#'+id).append(statusDiv);
					angular.element('#'+id).append(formElem);
					
				}else{
					
					// alert("Chat Room already Created");
				}
			}
			
			// $scope.imageClick	=	function(event){
			// 	console.log("entered image click");
			// 	event.target.previousElementSibling.onchange();
			// }
			$scope.upload	=	function(event){
				var imgSrc;
				console.log("enter Upload Function");
				var readURL	=	function(input) {
						if (input.files && input.files[0]) {
							var reader = new FileReader();
							
							reader.onload = function (e) {
								//console.log(e.target.result);
								imgSrc	=	e.target.result;
								var data	=	event.parentElement.previousElementSibling.id;
								var sendOptions	= {
									
										srcUser	:	$scope.userName,
										destUser : data,
										imageData	:	imgSrc
										}
								socket.emit("imageReq",sendOptions);	
									// angular.element('.chatRoom').append("<img src ='"+e.target.result+"'/>");
							// $('.txt').text=e.target.result;
							// 	$('#blah').attr('src', e.target.result);
							}
							reader.readAsDataURL(input.files[0]);
						}
					}
				readURL(event);
				
				// var data	=	event.target.id;
			
			}
			$scope.msgTyping	=	function(event){
				
				console.log("Msg typing");
				var data	=	event.target.nextElementSibling.id;
				var msg	=	event.target.value;
				var sendOptions	= {
					
						srcUser	:	$scope.userName,
						destUser : data,
						message :  msg
						}
				socket.emit("msgType",sendOptions);
				
			}
			$scope.sendMessage	=	function(event){
				
				console.log("enter send message");
				var targetUser	=	event.target.id;
				var msg	=	event.target.previousElementSibling.value;
				var sendOptions	= {
					
						srcUser	:	$scope.userName,
						destUser : targetUser,
						message :  msg
						}
				var temp =0;
				msgEle	=	angular.element('<div style="overflow:hidden;margin-bottom:3px;"><div class="srcMsgDiv"><p class="srcMsgText">'+msg+'</p></div></div>');
				id	=	targetUser+"Box";
				msgAppend	=	angular.element('#'+id);
				msgAppend.append(msgEle);
				event.target.previousElementSibling.value = '';
				socket.emit("send message",sendOptions);
			}
			socket.on('whisper',function(data){
					
				console.log("Whisper");
				id = data.srcUser	+ "status";
				angular.element('#'+id).text('');
				$scope.createChatRoom(data.srcUser);
				msgEle	=	angular.element('<div style="overflow:hidden;margin-bottom:3px;"><div class="desMsgDiv"><p class="dstMsgText">'+data.message+'</p></div></div>');
				id	=	data.srcUser+"Box";
				msgAppend	=	angular.element('#'+ id);
				msgAppend.append(msgEle);	
			})
			socket.on('msgRly',function(data){
				
				var msg	=	data.srcUser + " typing .......";
				$scope.status	=	msg;
				id	=	data.srcUser+"status";
				angular.element('#'+id).text(msg);
				$scope.statusShow	=	false;
				// while(1){
					
				// 	$timeout(function () { $scope.statusShow	=	true}, 100);
				// 	$scope.statusShow	=	false;
				// }
			})
			socket.on("image",function(info){
				// var ctx = document.getElementById('canvas').getContext('2d');
				// info.srcUser
				if (info.image) {
					
						var img = new Image();
						img.src = info.buffer;
						var imageDiv	= $compile(angular.element('<div style="overflow:hidden"><img class="'+info.className+'" src="'+img.src+'"/></div>'))($scope);
						// var imageDiv	= $compile(angular.element('<div style="overflow:hidden"><img class="'+info.className+'" src="'+img.src+'" ng-mouseover="zoomImage($event)" ng-mouseleave="regainImage($event)"/></div>'))($scope);
						console.log(imageDiv);
						id = info.user+"Box"; 
						angular.element('#'+id).append(imageDiv);
						if(!(angular.element('#'+id).append(imageDiv).length)){
							$scope.createChatRoom(info.user);
							id = info.user+"Box";
							angular.element('#'+id).append(imageDiv);
						}
						// ctx.drawImage(img, 0, 0);
						// console.log(img.src);
					}
			})
          
		  //Image Zooming
		  $scope.zoomImage	=	function(event){
			   
			  console.log("entered Zoom IMage");
			  $(event.target).addClass("zoomIMage");
			  $(event.target.parentNode).addClass("zoomParentClass");
			//   $scope.enlargeImg	="zoomIMage";
			}
			
		//ReZooming Image
		$scope.regainImage	=	function(event){
			
			$(event.target).removeClass("zoomIMage");
			$(event.target.parentNode).removeClass("zoomParentClass");
		}	
		}])