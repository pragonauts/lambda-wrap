'use strict';

const error = require('./error');

const contentTypes = {
    JSON: { 'Content-Type': 'application/json' },
    TEXT: { 'Content-Type': 'text/plain' }
};

const response = (data, event, context, callback, logger) => {
    const { headers } = event.options;
    console.log(data);
    if (typeof data === 'string') {
        Object.assign(headers, contentTypes.TEXT);
    } else if (typeof data === 'object' && data.statusCode) {
        Object.assign(headers, contentTypes.JSON);
    } else {
        throw error.badRequest('Auto negotiation of content type failed');
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
