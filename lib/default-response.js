'use strict';

const log = console;
log.sendAndClose = () => {};

const config = {
    cors: '*',
    isProduction: false
};

const defaultResponse = (data, callback, headers = { }) => {
    const res = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': config.cors,
            'Access-Control-Allow-Credentials': 'true',
            'Content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
    };

    Object.assign(res.headers, headers);
    log.sendAndClose();
    process.nextTick(() => callback(null, res));
};

module.exports = defaultResponse;
