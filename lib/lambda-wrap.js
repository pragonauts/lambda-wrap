'use strict';

const co = require('co');

const defaultResponse = require('./default-response');
const defaultErrorResponse = require('./default-error-response');

function LambdaWrap (options = {}) {

    const wrap = (fn) => {
        const wrapped = co.wrap(fn);

        return (event, context, callback) => {
            const {
                responseHandler, errorResponseHandler, middlewareHandlers, errorHandlers
            } = wrap;

            context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign
            event.options = options; // eslint-disable-line no-param-reassign

            const middlewarePromises = middlewareHandlers.reduce(
                (acc, cur) => acc.then(() => co.wrap(cur)(event, context)),
                Promise.resolve([])
            );

            return middlewarePromises
                .then(() => wrapped(event, context))
                .then(content => responseHandler(content, callback))
                .catch((err) => {
                    const catchPromises = errorHandlers.reduce(
                        (acc, cur) => (
                            acc.catch((e) => {
                                e = e || err; // eslint-disable-line no-param-reassign
                                return co.wrap(cur)(e, event, context);
                            })
                        ),
                        Promise.reject()
                    );

                    return catchPromises
                        .then(() => wrapped(event, context))
                        .then(content => responseHandler(content, callback))
                        .catch(e => errorResponseHandler(e, callback));
                });
        };
    };

    Object.setPrototypeOf(wrap, LambdaWrap.prototype);

    wrap.middlewareHandlers = [];
    wrap.errorHandlers = [];
    wrap.responseHandler = defaultResponse;
    wrap.errorResponseHandler = defaultErrorResponse;

    wrap.before = (fn) => {
        wrap.middlewareHandlers.push(fn);
    };

    wrap.catch = (fn) => {
        wrap.errorHandlers.push(fn);
    };

    wrap.response = (fn) => {
        wrap.responseHandler = fn;
    };

    wrap.errorResponse = (fn) => {
        wrap.errorResponseHandler = fn;
    };

    return wrap;
}

module.exports = {
    LambdaWrap
};
