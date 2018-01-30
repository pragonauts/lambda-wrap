'use strict';

const error = require('./error');

// Content types
const TEXT_TYPE = { 'Content-Type': 'text/plain' };
const JSON_TYPE = { 'Content-Type': 'application/json' };

const response = (data, event, context, callback, logger) => {
    const headers = event.headers || {};

    let res = data;

    if (typeof res === 'string') {
        res = {
            statusCode: 200,
            body: res
        };
    } else if (typeof res === 'object') {
        const {
            headers: dataHeaders = null,
            body = null,
            statusCode = 200
        } = res;

        if (dataHeaders !== null) {
            Object.assign(headers, dataHeaders);
        }

        res = {
            body,
            statusCode
        };
    } else {
        throw error.badRequest('Auto negotiation of response');
    }

    if (res.body === null) {
        delete res.body;
    } else if (typeof res.body === 'string') {
        Object.assign(headers, TEXT_TYPE);
    } else if (typeof res.body === 'object') {
        Object.assign(headers, JSON_TYPE);
        res.body = JSON.stringify(res.body);
    } else {
        throw error.badRequest('Auto negotiation of content type failed');
    }

    Object.assign(res, { headers });

    logger.log(res);

    process.nextTick(() => callback(null, res));
};

module.exports = response;
