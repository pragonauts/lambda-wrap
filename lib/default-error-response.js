'use strict';

const defaultErrorResponse = (err, event, context, callback) => {
    const { headers } = event.options;
    let e = err;

    if (Array.isArray(e)) {
        e = {
            status: e[0] && e[0].status,
            message: e.map(er => er.message)
        };
    }

    const statusCode = e.status || 500;

    // Send logs here

    const body = { error: e.message, code: statusCode };

    // Add stack only in development env
    body.stack = e.stack;

    const res = {
        statusCode,
        body: JSON.stringify(body),
        headers
    };

    process.nextTick(() => callback(null, res));

};

module.exports = defaultErrorResponse;
