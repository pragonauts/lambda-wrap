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
<a name="new_lambdaWrap_new"></a>

### new lambdaWrap([globalOptions])
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

**Returns**: <code>function</code> - - the wrap function  

| Param | Type | Description |
| --- | --- | --- |
| [globalOptions] | <code>LambdaWrapOptions</code> | Use to override or assign new attributes |

<a name="error"></a>

## error(message, code)
Return new error object.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Error message. |
| code | <code>integer</code> | Error code. |

