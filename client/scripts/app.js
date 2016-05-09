let entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
let escapeHtml = string => String(string).replace(/[&<>"'\/]/g, s => entityMap[s]);
let rooms = {};

let app = {

  init() {
    app.fetch(app.initialize);
  },


  send(message, callback) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      success(data, response) {
        let selectedRoom = $('#roomSelect :selected').val();
        app.fetch(callback, selectedRoom);
      },
    });
  },


  fetch(callback, optionalStr) {
    $.ajax({
      type: 'GET',
      url: app.server,
     // data: {order: '-createdAt'},
      dataType: 'json',
      success(data) {
        callback(data.results, optionalStr);
      }
    });
  },


  initialize(chatObj) {
    for (let i = 100; i > 90; i--) {
      app.addMessage(chatObj[chatObj.length - i]);
    }

    _.each(chatObj, messageObj => {
      let roomName = messageObj.roomname;
      if (rooms[roomName]) {
        rooms[roomName].push(messageObj);
      } else if (roomName !== undefined) {
        rooms[roomName] = [];
      }
    });

    _.each(rooms, (room, key, collection) => app.addRoom(key));
  },


  refresh(co) {
    //co is chatObject
    app.clearMessages();

    //len defaults to 0 if subtracting max chat brings index below 0.
    for (let i = co.length, len = co.length - 10 < 0 ? 0 : co.length - 10; i > len; i--) {
      app.addMessage(co[co.length - i]);
    }
  },


  handleSubmit() {
    let [message, userName, roomname] = [$('#message').val(), $('#user').val(), $('#roomSelect :selected').val()];
    let userObject = {
      username: userName,
      text: message,
      roomname: roomname,
    };

    app.send(userObject, app.filterRoom);

    $('#message').val('');
  
    return false;
  },
  

  filterRoom(co, roomName) {
    //co is chatObject
    app.clearMessages();
    let filteredRoom = _.filter(co, object => object.roomname === roomName);
    app.refresh(filteredRoom);
  },
   

  addRoom(roomName) {
    if ($(`#roomSelect option[value="${roomName}"]`).length <= 0) {
      $('#roomSelect').append(`<option value="${roomName}" id='${roomName}'>${escapeHtml(roomName)}</option>`); 
    }
  },


  addFriend(username) {
    if (!_.contains(app.friends, username)) {
      app.friends.push(username);
    }
  },


  handleNewRoom() {
    let roomname = $('#newRoom').val();
    app.addRoom(roomname);
    $('#newRoom').val('');
  },


  addMessage(message) {
    if(message !== undefined){
    let userText = escapeHtml(message.text);
    let userName = escapeHtml(message.username);

    _.each(app.friends, friend =>{
      if (friend === message.username) {
        message.friend = 'friend';
      } 
    });

    //Attaches class 'friend' to create bold/colored indicator if clicking on friend's username
    if (userName && message.friend) {
      $('#chats').prepend(`<div class='alert alert-success'><div class='username friend' data-username=${userName}>${userName}:</div><div class='texts'>
        ${userText}</div></div>`);
    
    //Otherwise append div without the 'friend' class
    } else if (userName && message.text) {
      $('#chats').prepend(`<div class='alert alert-success'><div class='username' data-username=${userName}>${userName}:</div><div class='texts'>
        ${userText}</div></div>`);
    }
  }
  },


  clearMessages() {
    $('#chats').empty();
  },


  friends: [],
  

  server: 'http://127.0.0.1:3000/classes/messages'

//End app object
};


$(document).ready(() => {

  app.init();

  $('#chats').on('click', '.username', function() {
    let friend = ($(this).data('username'));
    app.addFriend(friend);
  });
  
  $('#send').on('click', app.handleSubmit);

  $('#roomSend').on('click', app.handleNewRoom);
  
  $('#roomSelect').on('change', room => {
    let selectedRoom = $('#roomSelect :selected').val();

    app.fetch(app.filterRoom, selectedRoom);

  });


  setInterval(() => {
    let selectedRoom = $('#roomSelect :selected').val();

    app.fetch(app.filterRoom, selectedRoom);
  }, 1000);

});
//button on click(this, addFreind())
