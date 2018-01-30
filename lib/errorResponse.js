'use strict';

const errorResponse = (error, event, context, callback, logger) => {
    const { headers } = event;
    const { status, message, stack } = error;
    const statusCode = status || 500;
    const body = { message, code: statusCode };

    logger.error(body);

    if (event.isOffline) {
        body.stack = stack;
    }

    const res = {
        statusCode,
        body: JSON.stringify(body),
        headers
    };

    process.nextTick(() => callback(null, res));
};

module.exports = errorResponse;
