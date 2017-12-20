'use strict';

const co = require('co');

const defaultResponse = require('./default-response');
const defaultErrorResponse = require('./default-error-response');

const types = {
    MIDDLEWARE: 'middleware',
    CATCH: 'catch',
    WRAP: 'wrap'
};

function LambdaWrap (options = {}) {

    const wrap = (fn) => {
        const wrapped = { type: types.WRAP, fn: co.wrap(fn) };

        return (event, context, callback) => {
            const { responseHandler, errorResponseHandler, middlewareHandlers, catchHandlers } = wrap;

            Object.assign(context, { callbackWaitsForEmptyEventLoop: false });
            Object.assign(event, { options }); 

            const promisesToResolve = middlewareHandlers.concat(wrapped, catchHandlers).reduce((acc, cur) => {
                switch (cur.type) {
                    case types.MIDDLEWARE:
                        return acc.then(() => cur.fn(event, context));
                    case types.WRAP:
                        return acc.then(() => cur.fn(event, context));
                    case types.CATCH:
                        return acc.catch((err) => cur.fn(err));
                }
            }, Promise.all([]));

            return promisesToResolve
                .then(data => responseHandler(data, event, context, callback))
                .catch(err => errorResponseHandler(err, event, context, callback));
        };
    };

    Object.setPrototypeOf(wrap, LambdaWrap.prototype);

    wrap.middlewareHandlers = [];
    wrap.catchHandlers = [];
    wrap.responseHandler = defaultResponse;
    wrap.errorResponseHandler = defaultErrorResponse;

    wrap.before = (fn) => {
        wrap.middlewareHandlers.push({
            type: types.MIDDLEWARE,
            fn: co.wrap(fn)
        });
    };

    wrap.catch = (fn) => {
        wrap.catchHandlers.push({
            type: types.CATCH,
            fn: co.wrap(fn)
        });
    };

    return wrap;
}

module.exports = {
    LambdaWrap
};
