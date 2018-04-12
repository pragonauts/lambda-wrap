'use strict';

const error = require('./lib/error');
const lambdaWrap = require('./lib/lambdaWrap');

let warned = false;

module.exports = {

    LambdaWrap (...args) {
        if (!warned) {
            console.warn('Using `LambdaWrap` is deprecated. Please use `lambdaWrap` instead.'); // eslint-disable-line no-console
            warned = true;
        }
        return lambdaWrap(...args);
    },

    error,
    lambdaWrap
};
