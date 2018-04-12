# LambdaWrap

Simple async function wrapper for AWS lambda and serverless library

- allows using common middlewares (before, catch)
- allows to set common error response format
- supports generator functions using `co` (optional)

```javascript

const { lambdaWrap } = require('lambda-wrap');

const wrap = lambdaWrap({
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
    },
    callbackWaitsForEmptyEventLoop: false, // usefull for mongodb
    verboseError: true // include error stack in response (possible to )
    verboseLog: true // include headers and body in error log
});

wrap.before((event) => {
    if (event.body && `${event.headers['content-type']}`.match(/^application\/json/)) {
        event.body = JSON.parse(event.body);
    }
});

// or you can set custom logger
wrap.logger = console;

wrap.finally((error, response) => {
    // close connections or send logs
});

module.exports.myHandler = wrap(async (event) => {

    // return json body
    return {
        body: {
            objectAttribute: true
        }
    };
})

```

-----------------

# API
## Classes

<dl>
<dt><a href="#lambdaWrap">lambdaWrap</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#error">error(message, code)</a></dt>
<dd><p>Return new error object.</p>
</dd>
</dl>

<a name="lambdaWrap"></a>

## lambdaWrap
**Kind**: global class  

* [lambdaWrap](#lambdaWrap)
    * [new lambdaWrap([options])](#new_lambdaWrap_new)
    * [~wrap(fn)](#lambdaWrap..wrap) ⇒ <code>lambdaHandler</code>
        * [.responseHandler](#lambdaWrap..wrap.responseHandler)
        * [.errorResponseHandler](#lambdaWrap..wrap.errorResponseHandler)
        * [.logger](#lambdaWrap..wrap.logger)
        * [.before(fn)](#lambdaWrap..wrap.before)
        * [.catch(fn)](#lambdaWrap..wrap.catch)
        * [.finally(fn)](#lambdaWrap..wrap.finally)

<a name="new_lambdaWrap_new"></a>

### new lambdaWrap([options])
`lambdaWrap` function. You can pass options to override or assign new
attributes to `event` object. For example add custom headers:

<pre><code>
const headers = {
  'X-Auth-Token': 'my-token'
};

const wrap = lambdaWrap({ headers });
</code></pre>

It returns an instance of `LambdaWrap` - `wrap` object. This object can
be used for specifying additional properties:

<pre><code>
wrap.responseHandler = customResponseFunction;
</code></pre>

Finally, `wrap` object can be used as a function to wrap any generator
function and thus create lambda handler:

<pre><code>
const handler = wrap(async (event) => {
    return {
        body: 'Hello world'
    };
});
</pre></code>

**Returns**: <code>wrapFn</code> - - the wrap function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>LambdaWrapOptions</code> | Use to override or assign new attributes                                to `event` object. E.g. headers. |

<a name="lambdaWrap..wrap"></a>

### lambdaWrap~wrap(fn) ⇒ <code>lambdaHandler</code>
**Kind**: inner method of [<code>lambdaWrap</code>](#lambdaWrap)  
**Returns**: <code>lambdaHandler</code> - - Lambda handler.  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to be wrapped and used as a lambda handler. |


* [~wrap(fn)](#lambdaWrap..wrap) ⇒ <code>lambdaHandler</code>
    * [.responseHandler](#lambdaWrap..wrap.responseHandler)
    * [.errorResponseHandler](#lambdaWrap..wrap.errorResponseHandler)
    * [.logger](#lambdaWrap..wrap.logger)
    * [.before(fn)](#lambdaWrap..wrap.before)
    * [.catch(fn)](#lambdaWrap..wrap.catch)
    * [.finally(fn)](#lambdaWrap..wrap.finally)

<a name="lambdaWrap..wrap.responseHandler"></a>

#### wrap.responseHandler
Override default response function

**Kind**: static property of [<code>wrap</code>](#lambdaWrap..wrap)  
<a name="lambdaWrap..wrap.errorResponseHandler"></a>

#### wrap.errorResponseHandler
Override default error response function

**Kind**: static property of [<code>wrap</code>](#lambdaWrap..wrap)  
<a name="lambdaWrap..wrap.logger"></a>

#### wrap.logger
Override default logger object - `console`.
MUST implement `log`, `warn` and `error` methods.

**Kind**: static property of [<code>wrap</code>](#lambdaWrap..wrap)  
<a name="lambdaWrap..wrap.before"></a>

#### wrap.before(fn)
Add new middleware.

**Kind**: static method of [<code>wrap</code>](#lambdaWrap..wrap)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Middleware function. |

<a name="lambdaWrap..wrap.catch"></a>

#### wrap.catch(fn)
Add new catch.

**Kind**: static method of [<code>wrap</code>](#lambdaWrap..wrap)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Catch function. |

<a name="lambdaWrap..wrap.finally"></a>

#### wrap.finally(fn)
Add finally method, which will be called after each request

**Kind**: static method of [<code>wrap</code>](#lambdaWrap..wrap)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Middleware function. |

<a name="error"></a>

## error(message, code)
Return new error object.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Error message. |
| code | <code>integer</code> | Error code. |

