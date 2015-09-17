This explores the idea that iron-ajax could be extended to support server-side
preloading of data. This project contains two ideas:

1. sample-ajax: a simple fork of the iron-ajax component that can support
loading data from its light DOM children. When instantiated, if the component's
`preloaded` attribute is set, it will read its own textContent and process that
as if text were a server response.
2. A simple web server helper called componentDataPreloader. Given an HTML file
that's about to be served (e.g., by Express), this searches for components that
have a `preload="..."` attribute set. If any such components are found, the
preload attribute is taken to be the name of *another* attribute specifying a
URL. That URL will be fetched by the server, and the results spliced into the
HTML content before serving. The component's `preload` attribute will be
replaced with a `preloaded` attribute that triggers the loading behavior
described above.

Significantly, the preloading convention is general, and not specific to a
single type of component like iron-ajax. As long as the component exposes the
URL it will fetch data from as an attribute, the server can preload that data
at that URL.

# Running the demo

* Run `node server/app.js`.
* Open localhost:8000.
* By default, server data is preloaded in the sample-ajax component. In the
  debugger's Network tab, note that the page loads 13 resources. The page source
  will show JSON embedded in the HTML.
* If you remove `preload="url"` from the sample-ajax instance in index.html,
  the component will make a separate request to fetch data in the normal way.
  The page will now load 14 resources.
