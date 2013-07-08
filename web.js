var express = require('express');
var fs = require('fs');

var file = fs.readFileSync('index.html');
var string = new Buffer(file).toString();
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(string);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
