/*
 * @author David Menger
 */
'use strict';

let co;

try {
    co = module.require('co');
} catch (e) {
    co = null;
}

/**
 *
 * @param {Function|AsyncFunction|GeneratorFunction} fn
 */
function wrapFunction (fn) {
    if (typeof fn !== 'function') {
        throw new Error('Handler should be a function');
    }

    switch (fn.constructor.name) {
        case 'GeneratorFunction':
            if (co === null) {
                throw new Error('`co` must be present when using generators');
            }
            return co.wrap(fn);
        case 'AsyncFunction':
            return fn;
        default:
            return (...args) => Promise.resolve(fn(...args));
    }
}

module.exports = wrapFunction;
