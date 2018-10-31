/*
 * @author David Menger
 */
'use strict';

/**
 *
 * @param {Function|AsyncFunction|GeneratorFunction} fn
 */
function wrapFunction (fn) {
    if (typeof fn !== 'function') {
        throw new Error('Handler should be a function');
    }

    switch (fn.constructor.name) {
        case 'AsyncFunction':
            return fn;
        default:
            return (...args) => Promise.resolve(fn(...args));
    }
}

module.exports = wrapFunction;
