/* Import node's http module: */
var http = require('http');
var handleRequest = require('./request-handler.js');
var messages = require('./messages.js');
var express = require('express');
var path = require('path');
var fs = require('fs');

var cluster = require('cluster'); 
var numCPUs = require('os').cpus().length;

var app = express();
var messages = {result: []};
//console.log(__dirname)

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  app.use(express.static(path.join(__dirname, '../client')));
  var port = 3000;

  var ip = '127.0.0.1';


  //====================================================================
  //EXPRESS
  app.get('/', function(req, res) {
    res.sendFile(path.resolve('client/index.html'));
  });

  app.get('/classes/messages', function(req, res) {
    fs.readFile(__dirname + '/messages.txt', 'utf-8', function(err, data) {
      if (err) {
        console.log('error');
      } else {
        var split = data.trim().split('\n')
          .map(function(value) {
            return JSON.parse(value);
          });

        res.send(JSON.stringify({result: split.reverse()}));

      }
    });
  });

  app.post('/classes/messages', function(req, res) {
    var parsedmessage;
    
    req.on('data', function(message) {
      
      parsedmessage = JSON.parse(message);
      messages.result.push(parsedmessage);
      fs.appendFile(__dirname + '/messages.txt', JSON.stringify(parsedmessage) + '\n', function(err) {
        console.log(err);
      });

    });

    req.on('end', function() {
      res.send(JSON.stringify(messages.result));
    });

  });

  app.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    // next(err);
    res.send('BAD ERROR 404');
  });



  app.listen(port, ip);



}


//============== HTTP stuff ==============================
// var server = http.createServer(handleRequest.requestHandler);
// console.log('Listening on http://' + ip + ':' + port);
// server.listen(port, ip);



// To start this server, run:
//
//   node basic-server.js
//
// on the command line.
//
// To connect to the server, load http://127.0.0.1:3000 in your web
// browser.
//
// server.listen() will continue running as long as there is the
// possibility of serving more requests. To stop your server, hit
// Ctrl-C on the command line.

