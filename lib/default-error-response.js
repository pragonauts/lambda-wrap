'use strict';

const log = console;
log.sendAndClose = () => {};

const config = {
    cors: '*',
    isProduction: false
};

const defaultErrorResponse = (err, callback) => {
    let e = err;

    if (Array.isArray(e)) {
        e = {
            status: e[0] && e[0].status,
            message: e.map(er => er.message)
        };
    }

    const statusCode = e.status || 500;

    if (statusCode === 500) {
        console.error(err); // eslint-disable-line no-console
    }

    if (statusCode >= 500) {
        log.error(e);
    } else {
        log.warn(e);
    }

    log.sendAndClose();

    const body = { error: e.message, code: statusCode };

    if (!config.isProduction && e.stack) {
        body.stack = e.stack;
    }

    process.nextTick(() => callback(null, {
        statusCode,
        headers: { // Required for CORS support to work
            'Access-Control-Allow-Origin': config.cors,
            'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify(body)
    }));

};

module.exports = defaultErrorResponse;
