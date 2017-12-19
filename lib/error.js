'use strict';

const error = (message, code) => {
    const err = new Error(message);
    err.status = code;
    return err;
};

error.badRequest = (message = 'Bad request') => error(message, 400);
error.unauthorized = (message = 'Unauthorized') => error(message, 401);
error.forbidden = (message = 'Forbidden') => error(message, 403);
error.notFound = (message = 'Not found') => error(message, 404);
error.unprocessableEntity = (message = 'Unprocessable entity') => error(message, 422);

error.internalServerError = (message = 'Internal server error') => error(message, 500);
error.serviceUnavailable = (message = 'Service unavailable') => error(message, 503);

module.exports = error;
