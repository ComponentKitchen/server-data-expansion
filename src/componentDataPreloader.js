/**
 * Preload data requests in HTML.
 */

var cheerio = require('cheerio');
var request = require('request');

function preload(html, callback) {
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
        preload($.html(), callback);
      }
    });
  }
}

module.exports = {
  preload: preload
};
