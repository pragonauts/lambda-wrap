'use strict';

const errorResponse = (error, event, context, callback, options) => {
    const headers = Object.assign({}, options.headers || {});

    const {
        log = console
    } = options;

    const { status, message, stack } = error;
    const statusCode = status || 500;

    const body = {
        error: message,
        code: statusCode
    };

    if (options.verboseError) {
        body.stack = stack;
    }

    Object.assign(headers, {
        'Content-type': 'application/json; charset=utf-8'
    });

    let response = {
        statusCode,
        body,
        headers
    };

    const logMeta = options.createLogMeta(event, response, error);
    const logData = options.filterLogData(logMeta, options);

    log[logMeta.level](`request error: ${message}`, logData);

    response = Object.assign({}, response, {
        body: JSON.stringify(response.body)
    });

    process.nextTick(() => callback(null, response));
};

module.exports = errorResponse;
