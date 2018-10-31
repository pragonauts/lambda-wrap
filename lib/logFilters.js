/*
 * @author David Menger
 */
'use strict';

function levelFromStatusCode (statusCode) {
    if (statusCode < 400) {
        return 'info';
    }
    if (statusCode < 500) {
        return 'log';
    }
    return 'error';
}

module.exports.createLogMeta = (event, response, err = {}) => {
    const {
        path,
        httpMethod,
        body: requestBody,
        headers: requestHeaders,
        queryStringParameters,
        pathParameters
    } = event;

    const {
        statusCode,
        body,
        headers
    } = response;

    const level = levelFromStatusCode(statusCode);

    const { stack = null, message: error = null } = err || {};

    const logData = {
        error,
        level,
        statusCode,
        path,
        httpMethod,
        queryStringParameters,
        pathParameters,
        stack,
        requestHeaders,
        headers,
        requestBody,
        body
    };

    return logData;
};

module.exports.filterLogData = (logMeta, options) => {
    const {
        error,
        level,
        statusCode,
        path,
        httpMethod,
        queryStringParameters,
        pathParameters,
        stack,
        requestHeaders,
        headers,
        requestBody,
        body
    } = logMeta;

    const logData = {
        error,
        level,
        statusCode,
        requestHeaders,
        path,
        httpMethod,
        queryStringParameters,
        pathParameters,
        stack
    };

    if (options.verboseLog) {
        Object.assign(logData, {
            requestBody,
            headers,
            body
        });
    }

    if (typeof options.logFields === 'object') {
        Object.keys(options.logFields)
            .forEach((key) => {
                const val = options.logFields[key];
                if (val === false) {
                    delete logData[key];
                } else if (typeof val === 'function') {
                    logData[key] = val(logData[key]);
                    if (!logData[key]) {
                        delete logData[key];
                    }
                }
            });
    }

    return logData;
};
