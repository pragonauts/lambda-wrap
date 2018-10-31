'use strict';

const defaultResponse = require('./response');
const defaultErrorResponse = require('./errorResponse');
const wrapFunction = require('./wrapFunction');
const { filterLogData, createLogMeta } = require('./logFilters');

const MIDDLEWARE = 'middleware';
const CATCH = 'catch';
const WRAP = 'wrap';
const FINALLY = 'finally';

function reductor (event, context, input = null) {
    return [
        (acc, cur) => {
            switch (cur.type) {
                case MIDDLEWARE:
                    return acc.then(() => cur.fn(event, context));
                case WRAP:
                    return acc.then(() => cur.fn(event, context));
                case CATCH:
                    return acc.catch(err => cur.fn(err, event, context));
                case FINALLY:
                    return acc.then(([err, res]) => cur.fn(err, res, event, context)
                        .then(modify => modify || [err, res]));
                default:
                    return acc.then(() => Promise.reject(new TypeError('Unkown function type')));
            }
        },
        Promise.resolve(input)
    ];
}

/**
 * `lambdaWrap` function. You can pass options to override or assign new
 * attributes to `event` object. For example add custom headers:
 *
 * <pre><code>
 * const headers = {
 *   'X-Auth-Token': 'my-token'
 * };
 *
 * const wrap = lambdaWrap({ headers });
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
 * const handler = wrap(async (event) => {
 *     return {
 *         body: 'Hello world'
 *     };
 * });
 * </pre></code>
 *
 * @constructor
 * @param {LambdaWrapOptions} [globalOptions] - Use to override or assign new attributes
 * @returns {Function} - the wrap function
 */
function lambdaWrap (globalOptions = {}) {

    const wrap = (fn, overrideOptions) => {

        const options = Object.assign({
            filterLogData,
            createLogMeta
        }, globalOptions, overrideOptions);

        const wrapped = {
            type: WRAP,
            fn: wrapFunction(fn)
        };

        return function (event, context, callback) {

            const {
                responseHandler,
                errorResponseHandler,
                _middlewareHandlers,
                _catchHandlers,
                _finallyHandlers
            } = wrap;

            if (typeof options.callbackWaitsForEmptyEventLoop === 'boolean') {
                Object.assign(context, {
                    callbackWaitsForEmptyEventLoop: options.callbackWaitsForEmptyEventLoop
                });
            }

            Object.assign(event, {
                verboseError: options.verboseError,
                verboseLog: options.verboseLog
            });

            const promisesToResolve = _middlewareHandlers
                .concat(wrapped, _catchHandlers)
                .reduce(...reductor(event, context));

            let cb = callback;

            if (_finallyHandlers.length > 0) {
                cb = (err, res) => {
                    _finallyHandlers
                        .reduce(...reductor(event, context, [err, res]))
                        .then(([e, r]) => process.nextTick(() => callback(e, r)))
                        .catch((e) => {
                            const message = `Finally callback failed: ${e.message}`;
                            console.error(message, e); // eslint-disable-line no-console
                            if (options.log !== console) {
                                options.log.error(message, e);
                            }
                            callback(e);
                        });
                };
            }

            promisesToResolve
                .then(data => responseHandler(data, event, context, cb, options))
                .catch(err => errorResponseHandler(err, event, context, cb, options));
        };
    };

    // Private, not meant to be accessed directly.
    // Use wrap.before() and wrap.catch() instead.
    wrap._middlewareHandlers = [];
    wrap._catchHandlers = [];
    wrap._finallyHandlers = [];

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
     * Add new middleware.
     *
     * @param {Function} fn - Middleware function.
     */
    wrap.before = (fn) => {
        wrap._middlewareHandlers.push({
            type: MIDDLEWARE,
            fn: wrapFunction(fn)
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
            fn: wrapFunction(fn)
        });
    };

    /**
     * Add finally method, which will be called after each request
     *
     * @param {Function} fn - Middleware function.
     */
    wrap.finally = (fn) => {
        wrap._finallyHandlers.push({
            type: FINALLY,
            fn: wrapFunction(fn)
        });
    };

    return wrap;
}

module.exports = lambdaWrap;
