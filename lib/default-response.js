'use strict';

const response = (data, event, context, callback, logger) => {
    const { headers } = event.options;

    if (typeof data === 'string') {
        Object.assign(headers, { 'Content-Type': 'text/plain' });
    }

    if (typeof data === 'object' && data.statusCode && (data.body || data.headers)) {
        Object.assign(headers, { 'Content-Type': 'application/json' });
    }
    const res = {
        statusCode: data.statusCode || 200,
        body: JSON.stringify(data),
        headers
    };

    logger.log(res);

    process.nextTick(() => callback(null, res));
};

module.exports = response;
