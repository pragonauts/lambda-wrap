# LambdaWrap

-----------------

# API
## Classes

<dl>
<dt><a href="#LambdaWrap">LambdaWrap</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#error">error(message, code)</a></dt>
<dd><p>Return new error object.</p>
</dd>
</dl>

<a name="LambdaWrap"></a>

## LambdaWrap
**Kind**: global class

* [LambdaWrap](#LambdaWrap)
    * [new LambdaWrap([options])](#new_LambdaWrap_new)
    * [~wrap(fn)](#LambdaWrap..wrap) ⇒ <code>function</code>
        * [.responseHandler](#LambdaWrap..wrap.responseHandler)
        * [.errorResponseHandler](#LambdaWrap..wrap.errorResponseHandler)
        * [.logger](#LambdaWrap..wrap.logger)
        * [.before(fn)](#LambdaWrap..wrap.before)
        * [.catch(fn)](#LambdaWrap..wrap.catch)

<a name="new_LambdaWrap_new"></a>

### new LambdaWrap([options])
`LambdaWrap` constructor. You can pass options to override or assign new
attributes to `event` object. For example add custom headers:

<pre><code>
const headers = {
  'X-Auth-Token': 'my-token'
};

const wrap = new LambdaWrap({ headers });
</code></pre>

It returns an instance of `LambdaWrap` - `wrap` object. This object can
be used for specifying additional properties:

<pre><code>
wrap.responseHandler = customResponseFunction;
</code></pre>

Finally, `wrap` object can be used as a function to wrap any generator
function and thus create lambda handler:

<pre><code>
const handler = wrap(customGeneratorFunction);
</pre></code>

**Returns**: <code>Object</code> - - New instance of `LambdaWrap`.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Use to override or assign new attributes                                to `event` object. E.g. headers. |

<a name="LambdaWrap..wrap"></a>

### LambdaWrap~wrap(fn) ⇒ <code>function</code>
**Kind**: inner method of [<code>LambdaWrap</code>](#LambdaWrap)
**Returns**: <code>function</code> - - Lambda handler.

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to be wrapped and used as a lambda handler. |


* [~wrap(fn)](#LambdaWrap..wrap) ⇒ <code>function</code>
    * [.responseHandler](#LambdaWrap..wrap.responseHandler)
    * [.errorResponseHandler](#LambdaWrap..wrap.errorResponseHandler)
    * [.logger](#LambdaWrap..wrap.logger)
    * [.before(fn)](#LambdaWrap..wrap.before)
    * [.catch(fn)](#LambdaWrap..wrap.catch)

<a name="LambdaWrap..wrap.responseHandler"></a>

#### wrap.responseHandler
Override default response function

**Kind**: static property of [<code>wrap</code>](#LambdaWrap..wrap)
<a name="LambdaWrap..wrap.errorResponseHandler"></a>

#### wrap.errorResponseHandler
Override default error response function

**Kind**: static property of [<code>wrap</code>](#LambdaWrap..wrap)
<a name="LambdaWrap..wrap.logger"></a>

#### wrap.logger
Override default logger object - `console`.
MUST implement `log` and `error` methods.

**Kind**: static property of [<code>wrap</code>](#LambdaWrap..wrap)
<a name="LambdaWrap..wrap.before"></a>

#### wrap.before(fn)
Add new middleware.

**Kind**: static method of [<code>wrap</code>](#LambdaWrap..wrap)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Middleware function. |

<a name="LambdaWrap..wrap.catch"></a>

#### wrap.catch(fn)
Add new catch.

**Kind**: static method of [<code>wrap</code>](#LambdaWrap..wrap)

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Catch function. |

<a name="error"></a>

## error(message, code)
Return new error object.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Error message. |
| code | <code>integer</code> | Error code. |

