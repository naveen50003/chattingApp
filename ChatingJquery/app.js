var express 	=	require('express'),
	app	=	express(),
	server =	require('http').createServer(app),
	io	=	require('socket.io').listen(server),
	users	=	{},
	mongoose	=	require('mongoose'),
	loginUser	=	"navaneeth";
server.listen(3001,function(){
	
	console.log("server started at port 3001");
});

mongoose.connect('mongodb://localhost/chat',function(err){
	if(err){
		console.log(err);
	}else{
		console.log("Connected to MongoBD");
	}
});

var chatSchema	=	mongoose.Schema({
	nick	:	String,
	msg	:	String,
	created : {
		type:Date,
		default:Date.now()
	}
})

var Chat	=	mongoose.model("Message",chatSchema);
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
	res.sendFile('index1.html');
});
io.sockets.on('connection',function(socket){
	var query	=	Chat.find({});
	query.sort('-created').limit(8).exec(function(err,docs){
		if(err) throw err;
		socket.emit('load old msgs',docs);
	})
	socket.on('new user',function(data,callback){
		console.log("new user");
		// console.log(data);
		// console.log(users);
		// console.log(socket);
		if(data in users){
			callback(false);
		}else{
			// console.log("check");
			// console.log(users);
			callback(true);
			socket.nickname	=	data;
			users[socket.nickname]	=	socket;
			// console.log(users[socket.nickname]);
			updateNicknames();
		}

	});
	function updateNicknames(){
		io.sockets.emit('usernames',Object.keys(users));
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
				 if(name in users){
					 users[name].emit('whisper',{msg:msg,nick:socket.nickname})
					 socket.emit('whisper',{msg:msg,nick:socket.nickname})
					 console.log("whisper!");
				 }else{
					 callback("Error:! Enter a valid user");
				 }
			}else{
				callback("Error Please Enter message");
			}

		}else{
			var newMsg	=	new Chat({msg:msg,nick:socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
			})
		}
		// console.log(className);
	})
	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname]
		updateNicknames();
	})
})
