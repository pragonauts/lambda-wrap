'use strict';

const defaultErrorResponse = (error, event, context, callback, logger) => {
    const { headers } = event.options;
    const { status, message, stack } = error;
    const statusCode = status || 500;
    const body = { message, statusCode };

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

module.exports = defaultErrorResponse;
