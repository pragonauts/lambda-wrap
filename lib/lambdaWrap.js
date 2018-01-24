'use strict';

const co = require('co');

const defaultResponse = require('./response');
const defaultErrorResponse = require('./errorResponse');

const MIDDLEWARE = 'middleware';
const CATCH = 'catch';
const WRAP = 'wrap';

/**
 * `LambdaWrap` constructor. You can pass options to override or assign new
 * attributes to `event` object. For example add custom headers:
 *
 * <pre><code>
 * const headers = {
 *   'X-Auth-Token': 'my-token'
 * };
 *
 * const wrap = new LambdaWrap({ headers });
 * </code></pre>
 *
 * It returns an instance of `LambdaWrap` - `wrap` object. This object can
 * be used for specifying additional properties:
 *
 * <pre><code>
 * wrap.responseHandler = customResponseFunction;
 * </code></pre>
 *
 * Finally, `wrap` object can be used as a function to wrap any generator
 * function and thus create lambda handler:
 *
 * <pre><code>
 * const handler = wrap(customGeneratorFunction);
 * </pre></code>
 *
 * @constructor
 * @param {Object} [options={}] - Use to override or assign new attributes
 *                                to `event` object. E.g. headers.
 *
 * @returns {Object} - New instance of `LambdaWrap`.
 */
function LambdaWrap (options = {}) {

    /**
     *
     * @param {Function} fn - Function to be wrapped and used as a lambda handler.
     *
     * @returns {Function} - Lambda handler.
     */
    const wrap = (fn) => {

        const wrapped = {
            type: WRAP,
            fn: co.wrap(fn)
        };

        return function (event, context, callback) {

            const {
                responseHandler,
                errorResponseHandler,
                _middlewareHandlers,
                _catchHandlers,
                logger
            } = wrap;

            Object.assign(context, { callbackWaitsForEmptyEventLoop: false });

            Object.keys(options).forEach((option) => {
                if (event[option]) {
                    Object.assign(event[option], options[option]);
                } else {
                    event[option] = options[option]; // eslint-disable-line no-param-reassign
                }
            });

            const promisesToResolve = _middlewareHandlers.concat(wrapped, _catchHandlers)
                .reduce((acc, cur) => {
                    switch (cur.type) {
                        case MIDDLEWARE:
                            return acc.then(() => cur.fn(event, context));
                        case WRAP:
                            return acc.then(() => cur.fn(event, context));
                        case CATCH:
                            return acc.catch(err => cur.fn(err, event, context));
                        default:
                            throw new TypeError('Unkown function type');
                    }
                }, Promise.all([]));

            return promisesToResolve
                .then(data => responseHandler(data, event, context, callback, logger))
                .catch(err => errorResponseHandler(err, event, context, callback, logger));
        };
    };

    Object.setPrototypeOf(wrap, LambdaWrap.prototype);

    // Private, not meant to be accessed directly.
    // Use wrap.before() and wrap.catch() instead.
    wrap._middlewareHandlers = [];
    wrap._catchHandlers = [];

    // Public, meant to be accessed directly.
    /**
     * Override default response function
     * */
    wrap.responseHandler = defaultResponse;

    /**
     * Override default error response function
     * */
    wrap.errorResponseHandler = defaultErrorResponse;

    /**
     * Override default logger object - `console`.
     * MUST implement `log` and `error` methods.
     * */
    wrap.logger = console;

    /**
     * Add new middleware.
     *
     * @param {Function} fn - Middleware function.
     */
    wrap.before = (fn) => {
        wrap._middlewareHandlers.push({
            type: MIDDLEWARE,
            fn: co.wrap(fn)
        });
    };

    /**
     * Add new catch.
     *
     * @param {Function} fn - Catch function.
     */
    wrap.catch = (fn) => {
        wrap._catchHandlers.push({
            type: CATCH,
            fn: co.wrap(fn)
        });
    };

    return wrap;
}

module.exports = LambdaWrap;
