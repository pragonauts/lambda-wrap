'use strict';

const { assert } = require('chai');

const { LambdaWrap } = require('../../lib/lambda-wrap');

describe('LambdaWrap', () => {
    let wrap;
    let event;
    let context;
    let loggerMock;
    let fn;
    let doAsyncStuff;

    beforeEach(() => {
        // Initialize new Lambda wrap and mock event and context objects
        wrap = new LambdaWrap();
        event = {};
        context = {};

        loggerMock = {
            log: () => {},
            error: () => {}
        };

        wrap.logger = loggerMock;

        // Function to be passed to handler
        fn = function* () {
            return {
                message: 'test'
            };
        };

        // Mock asynchronous function
        doAsyncStuff = (outcome, bool) => (
            new Promise((resolve, reject) => {
                const error = new Error('Promise rejected');

                if (outcome === 'resolve') {
                    return setTimeout(() => resolve(bool), 100);
                }

                return setTimeout(() => reject(error), 100);
            })
        );
    });

    describe('constructor', () => {
        it('should return an instance of LambdaWrap', () => {
            assert.instanceOf(wrap, LambdaWrap);
        });

        it('should be able to assign new attributes to options', (done) => {
            event = {
                headers: { 'Access-Control-Allow-Origin': '*' }
            };

            wrap = new LambdaWrap({
                someOption: 'value'
            });

            wrap.logger = loggerMock;

            const handler = wrap(function* (e) {
                const { headers, someOption } = e;

                assert.equal(headers['Access-Control-Allow-Origin'], '*');
                assert.equal(someOption, 'value');
                done();

                return {
                    statusCode: 200,
                    message: 'test'
                };
            });

            handler(event, context, () => {});
        });

        it('should be able to assign new values options\' attributes', (done) => {
            event = {
                headers: { 'Access-Control-Allow-Origin': '*' }
            };

            wrap = new LambdaWrap({
                headers: { 'X-Auth-Token': '1234' }
            });

            wrap.logger = loggerMock;

            const handler = wrap(function* (e) {
                const { headers } = e;

                assert.equal(headers['X-Auth-Token'], '1234');
                assert.equal(headers['Access-Control-Allow-Origin'], '*');
                done();

                return {
                    statusCode: 200,
                    message: 'test'
                };
            });

            handler(event, context, () => {});
        });

        it('should set default response handler', () => {
            const { name } = wrap.responseHandler;

            assert.equal(name, 'response');
        });

        it('should set default error response handler', () => {
            const { name } = wrap.errorResponseHandler;

            assert.equal(name, 'errorResponse');
        });

        it('should initialize empty middleware handlers array', () => {
            const { _middlewareHandlers } = wrap;

            assert.deepEqual(_middlewareHandlers, []);
        });

        it('should initialize empty catch handlers array', () => {
            const { _catchHandlers } = wrap;

            assert.deepEqual(_catchHandlers, []);
        });

        it('should log set default logger');
    });

    describe('wrap', () => {
        xit('should return a function');
    });

    describe('responseHandler', () => {
        it('should allow to override default response handler', () => {
            const newResponseHandler = () => {};

            wrap.responseHandler = newResponseHandler;

            assert.equal(wrap.responseHandler, newResponseHandler);
        });
    });

    describe('errorResponseHandler', () => {
        it('should allow to override default error response handler', () => {
            const newErrorResponseHandler = () => {};

            wrap.errorResponseHandler = newErrorResponseHandler;

            assert.equal(wrap.errorResponseHandler, newErrorResponseHandler);
        });
    });

    describe('logger', () => {
        it('should allow to override default logger');
    });

    describe('before', () => {
        it('should be able to add synchronous middleware', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Middleware error');
                done();
            };

            wrap.before(() => {
                throw new Error('Middleware error');
            });

            const handler = wrap(fn);

            handler(event, context, callback);
        });

        it('should be able to add asynchronous middleware', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Middleware error');
                done();
            };

            wrap.before(function* () {
                const result = yield doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('Middleware error');
                }
            });

            const handler = wrap(fn);

            handler(event, context, callback);
        });

        it('should have access to event and context', (done) => {
            event = { name: 'event' };
            context = { name: 'context' };

            wrap.before((e, con) => {
                assert.equal(e.name, 'event');
                assert.equal(con.name, 'context');
                done();
            });

            const handler = wrap(fn);

            handler(event, context, () => {});
        });

        it('should execute middlewares in order', (done) => {
            const callback = () => {
                done();
            };

            wrap.before(function* (e) {
                const result = yield doAsyncStuff('resolve', true);

                if (result) {
                    e.options.headers = {
                        'X-Auth-Token': 'xyz123'
                    };
                }
            });

            wrap.before(function* (e) {
                yield doAsyncStuff('resolve', true);
                assert.equal(e.options.headers['X-Auth-Token'], 'xyz123');
            });

            const handler = wrap(fn);

            handler(event, context, callback);
        });
    });

    describe('catch', () => {
        it('should be able to add synchronous catch', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Catch error');
                done();
            };

            wrap.catch(function* () {
                throw new Error('Catch error');
            });

            const handler = wrap(function* () {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should be able to add asynchronous catch', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Catch error');
                done();
            };

            wrap.catch(function* () {
                const result = yield doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('Catch error');
                }
            });

            const handler = wrap(function* () {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should have access to error, event and context objects', (done) => {
            event = { name: 'event' };
            context = { name: 'context' };

            fn = function* () {
                throw new Error('Some test error');
            };

            wrap.catch((err, e, con) => {
                assert.equal(err.message, 'Some test error');
                assert.equal(e.name, 'event');
                assert.equal(con.name, 'context');
                done();
            });

            const handler = wrap(fn);

            handler(event, context, () => {});
        });

        it('should execute catches in order', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Second error');
                done();
            };

            wrap.catch(function* () {
                const result = yield doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('First error');
                }
            });

            wrap.catch(function* () {
                const result = yield doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('Second error');
                }
            });

            const handler = wrap(function* () {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should be able to return non error response', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.statusCode, 200);
                assert.equal(body.data, 'Some returned data');
                done();
            };

            wrap.catch(function* () {
                return { statusCode: 200, data: 'Some returned data' };
            });

            const handler = wrap(function* () {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });
    });
});
