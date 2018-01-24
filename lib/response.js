'use strict';

const error = require('./error');

// Content types
const TEXT_TYPE = { 'Content-Type': 'text/plain' };
const JSON_TYPE = { 'Content-Type': 'application/json' };

const response = (data, event, context, callback, logger) => {
    const headers = event.headers || {};

    if (typeof data === 'string') {
        Object.assign(headers, TEXT_TYPE);
    } else if (typeof data === 'object') {
        Object.assign(headers, JSON_TYPE);
    } else {
        throw error.badRequest('Auto negotiation of content type failed');
    }

    const statusCode = data.statusCode || 200;
    const body = JSON.stringify(data.body);

    const res = { statusCode, body };

    logger.log(res);

    process.nextTick(() => callback(null, res));
};

module.exports = response;
