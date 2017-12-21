'use strict';

const response = (data, event, context, callback, logger) => {
    const { headers } = event.options;
    const res = {
        statusCode: 200,
        body: JSON.stringify(data),
        headers
    };

    logger.log(res);

    process.nextTick(() => callback(null, res));
};

module.exports = response;
