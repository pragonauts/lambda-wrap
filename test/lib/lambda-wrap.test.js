'use strict';

// - new
//     X mozem vytvorit novy wrap
//     - novy wrap moze mat options ktore sa premietnu do event objectu
// - wrap
//     -
// - before
//     X mozem pridat sync middleware
//     X mozem pridat async middleware
//     X mozem pridat pole middlewares
//     X before ma pristup k event a context
//     X middleware su vzdy vykonane posebe a cakaju na vysledok predosleho
// - catch
//     X mozem pridat sync error
//     X mozem pridat async error
//     X mozem pridat pole errors
//     - catch ma pristup k event a context
//     X errors su vzdy vykonane posebe a cakaju na vysledok predosleho
//     - ak nezavolam v error throw tak sa vrati normalna response

const { assert } = require('chai');

const { LambdaWrap } = require('../../lib/lambda-wrap');

describe('LambdaWrap', () => {
    let wrap;
    let event;
    let context;
    let fn;
    let doSyncStuff;
    let doAsyncStuff;

    beforeEach(() => {
        // Initialize new Lambda wrap and mock event and context objects
        wrap = new LambdaWrap();
        event = {};
        context = {};

        // Function to be passed to handler
        fn = function* () {
            return {
                message: 'test'
            };
        };

        // Mock synchronous function
        doSyncStuff = bool => bool;

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

    describe('new', () => {
        it('should return an instance of LambdaWrap', () => {

            assert.instanceOf(wrap, LambdaWrap);
        });
    });

    describe('wrap', () => {

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

            const callback = (ctx, data) => {
                done();
            };

            wrap.before((event, context) => {
                assert.equal(event.name, 'event');
                assert.equal(context.name, 'context')
            });

            const handler = wrap(fn);

            handler(event, context, callback);
        });

        it('should execute middlewares in order', (done) => {
            const callback = (ctx, data) => {
                done();
            };

            wrap.before(function* (event) {
                const result = yield doAsyncStuff('resolve', true);

                if (result) {
                    event.options.headers = {
                        'X-Auth-Token': 'xyz123'
                    };
                }
            });

            wrap.before(function* (event) {
                const result = yield doAsyncStuff('resolve', true);
                assert.equal(event.options.headers['X-Auth-Token'], 'xyz123');
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

        xit('should have access to event and context', (done) => {

        });

        it('should execute catches in order', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.message, 'Second error');
                done();
            };

            wrap.catch(function* (err) {
                const result = yield doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('First error');
                }
            });

            wrap.catch(function* (err) {
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
    });

    describe('response', () => {

    });

    describe('errorResponse', () => {

    });

    describe('logger', () => {

    });
});
