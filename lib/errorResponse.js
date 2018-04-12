'use strict';

const errorResponse = (error, event, context, callback, logger, options) => {
    const headers = options.headers || {};

    const {
        path,
        httpMethod,
        body: eventBody,
        headers: requestHeaders,
        queryStringParameters,
        pathParameters
    } = event;
    const { status, message, stack } = error;
    const statusCode = status || 500;

    const body = {
        error: message,
        code: statusCode
    };

    const logMethod = statusCode < 500 ? 'warn' : 'error';

    const log = {
        status,
        path,
        httpMethod,
        queryStringParameters,
        pathParameters,
        stack
    };

    if (event.verboseLog) {
        Object.assign(log, {
            eventBody,
            headers,
            requestHeaders
        });
    }

    logger[logMethod](`Handler error: ${message}`, log);

    if (event.verboseError) {
        body.stack = stack;
    }

    Object.assign(headers, {
        'Content-type': 'application/json; charset=utf-8'
    });

    const res = {
        statusCode,
        body: JSON.stringify(body),
        headers
    };

    process.nextTick(() => callback(null, res));
};

module.exports = errorResponse;
