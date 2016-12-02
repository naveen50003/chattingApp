var express 	=	require('express'),
	app	=	express(),
	server =	require('http').createServer(app),
	io	=	require('socket.io').listen(server),
	fs		=	require('fs'),
	users	=	[],
	user	=	{},
	user1	=	{},
	sendUserDetails	=	[],
	mongoose	=	require('mongoose'),
	loginUser	=	"navaneeth";
server.listen(3001,function(){
	console.log("server started at port 3001");
});
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
	res.sendFile('index.html');
});
io.sockets.on('connection',function(socket){
	
	// console.log(socket , "has be connected to Server socket");
	console.log(socket.id , "has be connected to Server");
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
			// console.log(socket.nickname);
			users.push(user);
			// console.log("USers details before insertion");
			// console.log(sendUserDetails);
			sendUserDetails.push(user1);
			updateNicknames();
		}
	});
	function updateNicknames(){
		// console.log(users);
		// console.log("USers details after insertion");
		// console.log(sendUserDetails);
		io.sockets.emit('usernames',sendUserDetails);
	}
	socket.on('send message',function(data){
		console.log("entered send msg in server Socket Side");
		console.log(data);
		var result = search(data.destUser, users);
		io.to(result.socketName.id).emit('whisper', data);
		// var sendResMsg	=	{
		// 		msg:data.message,
		// 		destUser:data.destUser,
		// 		srcUser	:	data.srcUser
		// 		};
		// console.log(sendResMsg);
		// users[data.destUser].emit('whisper',sendResMsg);
		// io.to(users[data.destUser].id).emit('whisper', data);
	})
	socket.on('msgType',function(data){
		var result = search(data.destUser, users);
		io.to(result.socketName.id).emit('msgRly', data);
		// io.to(users[data.srctUser].id).emit('msgRly', data);		
	})
	socket.on('imageReq',function(data){
		
		console.log("entered image Req in server side");
		// fs.readFile(__dirname+'/public/images/sample.png',function(err,buf){
		// 	console.log(buf);
		// 	console.log(buf.toString('base64'))
		// 	io.to(users[data.destUser].id).emit('image',{
		// 			user:data.srcUser,
		// 			image:true,
		// 			className:"imageDestMsg",
		// 			buffer:buf.toString('base64')});
		// 	console.log('image file is initialized');
		// 	io.to(users[data.srcUser].id).emit('image',{
		// 			user:data.destUser,
		// 			image:true,
		// 			className:"imageSrcMsg",
		// 			buffer:buf.toString('base64')});
		// })
		var buf	=data.imageData;
		var result = search(data.destUser, users);
		io.to(result.socketName.id).emit('image',{
					user:data.srcUser,
					image:true,
					className:"imageDestMsg",
					buffer:buf});
			console.log('image file is initialized');
		result = search(data.srcUser, users);
		io.to(result.socketName.id).emit('image',{
					user:data.destUser,
					image:true,
					className:"imageSrcMsg",
					buffer:buf});
	})
	socket.on('disconnect',function(data){
		console.log("connection closed");
		// console.log(data);
		if(!user.login) return;
		// delete users[socket.nickname]
		var name	= user.login;
		console.log("socket disconnected");
		console.log(name);
		var result	=	search(name, sendUserDetails);
		if(result){
			result.status	= "offline";
		}
		updateNicknames();
	})
	function search(nameKey, myArray){
		// console.log(myArray);
		for (var i=0; i < myArray.length; i++) {
			if (myArray[i].login === nameKey) {
				return myArray[i];
			}
		}
	}
});