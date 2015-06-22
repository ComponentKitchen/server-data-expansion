var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();
var clientPath = path.join(__dirname, '../client');

app.get('/', function(request, response) {
  renderHtml(request.path, function(err, html) {
    if (!err) {
      response.set('Content-Type', 'text/html');
      response.send(html);
    }
  });
});

app.use(express.static(clientPath));
app.listen(8000);

function renderHtml(relativePath, callback) {
  if (relativePath === '/') {
    relativePath = 'index.html';
  }
  var filePath = path.join(clientPath, relativePath);
  console.log(filePath);
  fs.readFile(filePath, function(err, data) {
    callback(err, data);
  });
}
