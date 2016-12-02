var express		= 	require('express');
var mongoose	=	require('mongoose');
var app	=	express();
var server	=	require('http').Server(app);
var io	=	require('socket.io')(server);
app.use(express.static(__dirname+'/public'));
mongoose.connect("mongodb://127.0.0.1:27017/scotch-chat");
// create a schema for chat
var ChatSchema = mongoose.Schema({
  created: Date,
  content: String,
  username: String,
  room: String
});

// create a model from the chat schema
var Chat = mongoose.model('Chat', ChatSchema);

// allow CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.get('/', function(req, res) {
  //send the index.html in our public directory
  res.sendfile('index.html');
});
app.post('/setup',function(req,res){
	
	var chatData	=[{
		created: new Date(),
		content: 'Hi',
		username: 'Chris',
		room: 'php'
	}, {
		created: new Date(),
		content: 'Hello',
		username: 'Obinna',
		room: 'laravel'
	}, {
		created: new Date(),
		content: 'Ait',
		username: 'Bill',
		room: 'angular'
	}, {
		created: new Date(),
		content: 'Amazing room',
		username: 'Patience',
		room: 'socet.io'
		}]
	for (var c = 0; c < chatData.length; c++) {
    //Create an instance of the chat model
    var newChat = new Chat(chatData[c]);
    //Call save to insert the chat
    newChat.save(function(err, savedChat) {
      console.log(savedChat);
    });
  }
  
  res.send('created');
})

app.get('/msg', function(req, res) {
  //Find
  Chat.find({
    'room': req.query.room.toLowerCase()
  }).exec(function(err, msgs) {
    //Send
    res.json(msgs);
  });
});

/*||||||||||||||||SOCKET|||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {
	
	var defaultRoom	=	'general';
	var rooms	=	["General", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];
	
  socket.emit('setup',{
    rooms:rooms
  })
	 socket.on('new user', function(data) {
    data.room = defaultRoom;
    //New user joins the default room
    socket.join(defaultRoom);
    //Tell all those in the room that a new user joined
    io.in(defaultRoom).emit('user joined', data);
  });

  socket.on('switch room',function(data){
    
    socket.leave(data.oldRoom);
    socket.join(data.newRoom);
    io.in(data.oldRoom).emit('user left',data);
    io.in(data.newRoom).emit('user join',data);
  });
    //Listens for a new chat message
  socket.on('new message', function(data) {
    //Create message
    var newMsg = new Chat({
      username: data.username,
      content: data.message,
      room: data.room.toLowerCase(),
      created: new Date()
    });
    //Save it to database
    newMsg.save(function(err, msg){
      //Send message to those connected in the room
      io.in(msg.room).emit('message created', msg);
    });
  });
});

server.listen(3000,function(){
	
	console.log('It\'s going down in 3000');
});



