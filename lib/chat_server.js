var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function (socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, '神盾局大廳');
   	handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    socket.on('rooms', function() {
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    handleClientDisconnection(socket, nickNames, namesUsed);
	/*updateNicknames(); */////////////////////////////////////////////////// 
  });
};

function now() {
    var date = new Date();
    var time = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = '訪客' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNumber + 1;
}

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room});
  socket.broadcast.to(room).emit('message',{
    text: '[' + now() + ']' + nickNames[socket.id] + '已經加入' + room + '.'
  }); 
  
  var usersInRoom = io.sockets.clients(room);   //////////
  if (usersInRoom.length > 1) {
    var usersInRoomSummary = '您目前的房間內有' + ' : ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
       
	  if (userSocketId != socket.id) {	
		if (index > 0) {
          usersInRoomSummary += ', ';
		}
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary}); 
  }
  
   ///////////// 廣播給房間所有人 
		  
   /*socket.broadcast.to(room).emit('roomPeople',{io.socket.clients(room)}); */
   
   ///////  
}

function updateNicknames(){  
  sockets.emit('usernames', nicknames);  
}  
////////////////

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function(name) {
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: '[' + now() + ']' + previousName + ' 已更改暱稱為 ' + name + '.'
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

function handleMessageBroadcasting(socket) {       
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: '[' + now() + ']' + nickNames[socket.id] + ': ' + message.text
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var name = nickNames[socket.id];
	socket.broadcast.to(currentRoom[socket.id]).emit('message', {
       text: '[' + now() + ']' + name + ' 已經離線 ' 
    });
	var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
