/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var http = require('http');
var fs = require('fs');
//var messagesLog = require('./messages.js')
var messages = {result: []};

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  console.log('Serving request type ' + request.method + ' for url ' + request.url);


  // The outgoing status.
  // var statusCode;// = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  var statusCode = 404;
  var basePath = 'http://127.0.0.1:3000';
  var filePath = '.' + request.url;
//  var filePath = request.url;
  //console.log(filePath, basePath);

  if (request.url === '/classes/messages') {
    if (request.method === 'GET') {
    //  console.log('asdfadsf');
      statusCode = 200;
      headers['Content-Type'] = 'text/json';
      response.writeHead(statusCode, headers);
      // response.end(JSON.stringify(messages);
      


      fs.readFile(__dirname + '/messages.txt', 'utf-8', function(err, data) {
        if (err) {
          console.log('error');
        } else {
          // response.end(JSON.stringify(TXT))
         // data = data.slice(0, data.length - 1);
        //  console.log('type:', typeof data);
          // console.log('\nmessages:', JSON.stringify(messages) + '\n');
          // console.log('\n' + data + ']}' + '\n');
          // console.log(JSON.stringify(messages) === data + ']}');
          var split = data.trim().split('\n')
            .map(function(value) {
             // console.log('value', value);
              //console.log('parsed', JSON.parse(value));
              return JSON.parse(value);
            });

          response.end(JSON.stringify({result: split}));

          //response.end(JSON.stringify(data + ']}'));
        }
      });

    } else if (request.method === 'POST') {
      var parsedmessage;

      request.on('data', function(message) {
        
        parsedmessage = JSON.parse(message);
        //console.log('IS THIS AN OBJ', parsedmessage);
        messages.result.push(parsedmessage);
        fs.appendFile(__dirname + '/messages.txt', JSON.stringify(parsedmessage) + '\n', function(err) {
          console.log(err);
        });

      });

      request.on('end', function() {
        statusCode = 201;
        headers['Content-Type'] = 'text/json';
        response.writeHead(statusCode, headers);
        console.log('message.rseults', messages.result);
        response.end(JSON.stringify(messages.result));

      });
     
    }

  } else if (filePath === './') {
    filePath = './client/index.html';

    fs.readFile(filePath, function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
      } else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(content, 'utf-8');
      }
    });
    
  } else if (filePath.split('.')[2] === 'css') {
    //console.log('hihihihi');
    console.log('filePath', filePath);
    fs.readFile('./client' + filePath.slice(1), function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
      } else {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.end(content, 'utf-8');
      }
    });

  } else if (filePath.split('.')[2] === 'js' || 'ttf') {

    fs.readFile('./client' + filePath.slice(1), function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
      } else {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
        response.end(content, 'utf-8');
      }
    });

  } else {
    response.writeHead(404, headers);
    response.end();
  } 


};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

//exports.requestHandler = requestHandler;