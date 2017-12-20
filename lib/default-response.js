'use strict';

const response = (data, event, context, callback) => {
    const { headers } = event.options;
    const res = {
        statusCode: 200,
        body: JSON.stringify(data),
        headers
    };

    // Send logs here
    process.nextTick(() => callback(null, res));
};

module.exports = response;
