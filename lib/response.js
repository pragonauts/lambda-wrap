'use strict';

const error = require('./error');

// Content types
const TEXT_TYPE = { 'Content-Type': 'text/plain' };
const JSON_TYPE = { 'Content-Type': 'application/json' };

const response = (data, event, context, callback, logger) => {
    const headers = event.headers || {};

    if (typeof data === 'string') {
        Object.assign(headers, TEXT_TYPE);
    } else if (typeof data === 'object' && data.statusCode) {
        Object.assign(headers, JSON_TYPE);
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
