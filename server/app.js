var express = require('express');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

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
  fs.readFile(filePath, function(err, html) {
    if (err) {
      callback(err);
    } else {
      preloadData(html, callback);
    }
  });
}

function preloadData(html, callback) {
  var $ = cheerio.load(html);
  var component = $('[preload][url]').eq(0);
  if (component.length === 0) {
    console.log('no (more) components found');
    callback(null, $.html());
  } else {
    var url = component.attr('url');
    console.log('found component with url ' + url);
    request(url, function(err, response, body) {
      if (err) {
        callback(err);
      }
      else {
        component.attr('preload', null);
        component.attr('preloaded', true);
        component.text(body);
        preloadData($.html(), callback);
      }
    });
  }
}
