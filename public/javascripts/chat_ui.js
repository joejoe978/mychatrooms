var scrollHeightDiff = 0;
/*
function scroll_control()
{
        var scrObj = document.getElementById("messages");
        var diff = 0;
        diff = scrObj.scrollHeight - scrollHeightDiff ;
        scrollHeightdiff = scrObj.scrollHeight
        //捲軸控制，置底時強制置底，非置底時不予控制
        if(!(scrollHeightDiff - (scrObj.scrollTop + diff + Div_scrollTop&scrollHeight_diff)))
                scrObj.scrollTop = scrObj.scrollHeight;
}
*/

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;
  
  //scroll_control();  ///////////////////////////////////
  
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElement('[' + now() + ']'+'你說:' + message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

/////////////////////////////////////time 
function now() {
    var date = new Date();
    var time = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
}

var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);
  
  //scroll_control();  ///////////////////////////////////
  
  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = '[' + now() + ']' + '您現在的暱稱為' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
	$('#room-people').append(divEscapedContentElement(result.name));  //在 room-people 新增自己名字
  });

  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
	  message = '[' + now() + ']' + '您已經加入' + result.room + '.';
    $('#messages').append(divSystemContentElement(message));    
	
  });

  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
	$('#messages').append(newElement);
  });

  
  ////////////////////////// 廣播給該房間所有人 更新他們的room-people 
  socket.on('roomPeople',function(names){
	 $('#room-people').empty();
	 for(var name in names) {
		 name = name.substring(1, names.length);
		 if(name != '') {
			 $('#room-people').append(divEscapedContentElement(name));
		 }
	 }
  })
  
   socket.on('usernames', function(data){  
      var sb = '';  
      for(var d = 0; d < data.length; d++ ) {  
          console.log(data[d]);  
          sb += data[d] + "<br />";  
      }  
       $('#room-people').html(sb);  
   });  

 
  //////////////////////////
 
 
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });
 
  
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
   
  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
