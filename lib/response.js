'use strict';

const error = require('./error');

// Content types
const TEXT_TYPE = { 'Content-Type': 'text/plain; charset=utf-8' };
const JSON_TYPE = { 'Content-Type': 'application/json; charset=utf-8' };

const response = (data, event, context, callback, options) => {
    const headers = Object.assign({}, options.headers || {});

    const {
        log = console
    } = options;

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
    } else if (typeof res === 'undefined') {
        res = null;
    } else {
        throw error.badRequest('Auto negotiation of response');
    }

    if (res) {
        Object.assign(res, { headers });
    }

    const logMeta = options.createLogMeta(event, res || { statusCode: 0 });
    const logData = options.filterLogData(logMeta, options);

    log[logMeta.level]('request', logData);

    if (!res) {
        // leave it, it's ok, that's empty
    } else if (res.body === null) {
        delete res.body;
    } else if (typeof res.body === 'string') {
        Object.assign(headers, TEXT_TYPE);
    } else if (typeof res.body === 'object') {
        Object.assign(headers, JSON_TYPE);
        res.body = JSON.stringify(res.body);
    } else {
        throw error.badRequest('Auto negotiation of content type failed');
    }

    process.nextTick(() => callback(null, res));
};

module.exports = response;
