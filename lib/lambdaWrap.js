'use strict';

const co = require('co');

const defaultResponse = require('./response');
const defaultErrorResponse = require('./errorResponse');

const MIDDLEWARE = 'middleware';
const CATCH = 'catch';
const WRAP = 'wrap';

/**
 * Lorem ipsum.
 *
 * @constructor
 * @param {Object} [options={}] - Assign attributes to event object.
 */
function LambdaWrap (options = {}) {

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
    wrap.responseHandler = defaultResponse;
    wrap.errorResponseHandler = defaultErrorResponse;
    wrap.logger = console;

    wrap.before = (fn) => {
        wrap._middlewareHandlers.push({
            type: MIDDLEWARE,
            fn: co.wrap(fn)
        });
    };

    wrap.catch = (fn) => {
        wrap._catchHandlers.push({
            type: CATCH,
            fn: co.wrap(fn)
        });
    };

    return wrap;
}

module.exports = LambdaWrap;
