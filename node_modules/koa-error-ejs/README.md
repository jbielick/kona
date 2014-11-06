# koa-error-ejs
  
  Error response middleware for koa supporting:

- text
- json
- html

  Based on [koa-error](https://github.com/koajs/error), adapter to use EJS as view  

## Installation

```js
$ npm install koa-error
```

  and then copy the default error view to your views folder

```js
$ cp node_modules/koa-error-ejs/error.html views/
```

## Options

 - `view` String path to template written with [ejs](http://embeddedjs.com). Defaults to {view.root}/error  
 - `layout` String|Boolean layout to use on error view, or false if none. Defaults to false.  
 - `custom` Object specific view for a status code, for example:  {404: 'error/not-found'}. Defaults to {}  

## Custom templates

  By using the `view` option you can override the bland default template,
  with the following available local variables:

  - `env`
  - `ctx`
  - `request`
  - `response`
  - `error`
  - `stack`
  - `status`
  - `code`

Here's an example:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Error - <%=status%></title>
  </head>
  <body>
    <div id="error">
      <h1>Error</h1>
      <p>Looks like something broke!</p>
      <% if(env === 'development'){ %>
      <pre>
        <code>
	  <%-stack%>
        </code>
      </pre>
      <% } %>
    </div>
  </body>
</html>
```

## License

  MIT
