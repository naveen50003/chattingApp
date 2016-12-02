var express 	=	require('express'),
	app	=	express(),
	server =	require('http').createServer(app),
	io	=	require('socket.io').listen(server),
	users	=	[],
	user	=	{},
	user1	=	{},
	sendUserDetails	=	[],
	loginUser	=	"navaneeth";
	// loginClass	=	"online";
server.listen(3000,function(){
	console.log("server started at port 3000");
});
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
	res.sendFile('index1.html');
});
io.sockets.on('connection',function(socket){
	socket.on('new user',function(data,callback){
		var result = search(data, sendUserDetails);
			if(result){
				if(result.status === "offline")
				{
					callback(false);
					result.status	=	"online";
					socket.nickname	=	result.login;
					updateNicknames();
				}
				else{
					callback("user Exists");
				}
			}
			else{
					console.log("no user with that username");
					callback(true);
					socket.nickname	=	data;
					user ={
						login	: data,
						socketName	:	socket,
						status	: "online",
						userN	:socket.nickname
					}
					user1 = {
						login :data,
						status:"online"
					}
					console.log("sending message");
				    console.log(socket.nickname);
					users.push(user);
					sendUserDetails.push(user1);
					updateNicknames();
				}
	});
	function search(nameKey, myArray){
		// console.log(myArray);
		for (var i=0; i < myArray.length; i++) {
			if (myArray[i].login === nameKey) {
				return myArray[i];
			}
		}
	}
	function updateNicknames(){
		// console.log(users);
		io.sockets.emit('usernames',sendUserDetails);
	}
	socket.on('send message',function(data,callback){
		var className	= "other";
		if(socket.nickname	===	loginUser){
			className	=	"self";
		}
		var msg	=	data.trim();
		console.log(msg);
		if(msg.substr(0,3)	===	'/w '){
			console.log("entered");
			msg = msg.substr(3);
			var ind	=	msg.indexOf(' ');
			if(ind	!== -1){
				 var name	=	msg.substr(0,ind);
				 var msg	=	msg.substr(ind+1);
				 var result = search(name, users);
				 if(result){
					 result.socketName.emit('whisper',{msg:msg,user:socket.nickname,typeOfUser:className})
					 console.log("whisper!");
				 }else{
					 callback("Error:! Enter a valid user");
				 }
			}
			
		}else{
			io.sockets.emit('new message',{msg:msg,user:socket.nickname,typeOfUser:className});	
		}
		// console.log(className);
	})
	socket.on('disconnect',function(data){
		console.log("connection closed");
		// console.log(data);
		if(!user.login) return;
		// delete users[socket.nickname]
		var name	= user.login;
		var result	=	search(name, sendUserDetails);
		if(result){
			result.status	= "offline";
		}
		updateNicknames();
	})
})