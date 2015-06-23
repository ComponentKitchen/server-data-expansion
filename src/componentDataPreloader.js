/**
 * Preload data requests in HTML.
 */

var cheerio = require('cheerio');
var request = require('request');
var url = require('url');

/*
 * Return the given HTML with any data components preloaded inline.
 *
 * For a component to be preloaded, it must set a "preload" attribute to a
 * value (e.g., "url") that points to another attribute that holds a URL.
 */
function preload(html, callback) {
  var $ = cheerio.load(html);
  // We need to deal with callbacks for each preload request, and we have to
  // invoke a callback when we're done. That'd be easy enough to handle with
  // promises, but to keep this code as plain Node.js code as possible, we only
  // process the first preloadable data component we find. We invoke this
  // function recursively to handle any subsequent preloadable data components.
  // That's quite inefficient -- we'll end up parsing the HTML again in each
  // pass -- but keeps the code simpler.
  var component = $('[preload]').eq(0);
  var preloadAttribute = component.length > 0 && component.attr('preload');
  var dataUrl = preloadAttribute && component.attr(preloadAttribute);
  if (!dataUrl) {
    // No more preloadable components exist.
    callback(null, $.html());
  } else {
    var urlParts = url.parse(dataUrl);
    var readFile = urlParts.host
      ? readRemoteFile // URL has host = use HTTP
      : this.readLocalFile; // URL has no host == local file
    readFile(dataUrl, function(err, content) {
      if (err) {
        callback(err);
      }
      else {

        // Replace the "preload" attribute with a "preloaded" attribute to
        // indicate success.
        component.attr('preload', null);
        component.attr('preloaded', true);

        // Add the preloaded data inline.
        component.empty();
        component.append('\n');
        component.append(encapsulateData(content));
        component.append('\n');

        // Recurse to catch any subsequent data components.
        preload($.html(), callback);
      }
    });
  }
}

// Return a safe HTML representation encapsulating the indicated data.
function encapsulateData(data) {
  var $ = cheerio;
  var script = $('<script>');
  script.attr('type', 'application/json');
  script.text('\n' + data);
  return script;
}

// Return the contents of the indicated remote file.
function readRemoteFile(fileUrl, callback) {
  request(fileUrl, function(err, response, body) {
    callback(err, body);
  });
}

module.exports = {
  readLocalFile: null,
  preload: preload
};
