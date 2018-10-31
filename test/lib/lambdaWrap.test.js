'use strict';

const { assert } = require('chai');

const lambdaWrap = require('../../lib/lambdaWrap');

describe('LambdaWrap', () => {
    let wrap = lambdaWrap();
    let event;
    let context;
    let loggerMock;
    let fn;
    let doAsyncStuff;

    beforeEach(() => {
        // Initialize new Lambda wrap and mock event and context objects
        wrap = lambdaWrap();
        event = {};
        context = {};

        loggerMock = {
            log: () => {},
            error: (e) => { console.warn(e); }, // eslint-disable-line
            warn: () => {}
        };

        wrap.logger = loggerMock;

        // Function to be passed to handler
        fn = async () => ({
            message: 'test'
        });

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
        it('should return a function');

        it('should accept async functions', (done) => {
            const handler = wrap(async (ev) => {
                const { body } = ev;

                await new Promise(r => setTimeout(r, 10));

                return {
                    body
                };
            });

            const callback = (ctx, data) => {
                assert.equal(data.body, 'Hello');
                done();
            };

            handler({ body: 'Hello' }, context, callback);
        });

        it('should not share headers', (done) => {
            const wr = lambdaWrap({ headers: { A: 1 } });

            const handler = wr(async (ev) => {
                const { body } = ev;

                await new Promise(r => setTimeout(r, 10));

                return {
                    body,
                    headers: { B: 1 }
                };
            });

            const callback = (ctx, data) => {
                assert.deepEqual(data.headers, { A: 1, B: 1, 'Content-Type': 'text/plain; charset=utf-8' });

                const handler2 = wr(async (ev) => {
                    const { body } = ev;

                    await new Promise(r => setTimeout(r, 10));

                    return {
                        body,
                        headers: { C: 1 }
                    };
                });

                const callback2 = (c, dt) => {
                    assert.deepEqual(dt.headers, { A: 1, C: 1, 'Content-Type': 'text/plain; charset=utf-8' });
                    done();
                };

                handler2({ body: 'Hello' }, context, callback2);
            };

            handler({ body: 'Hello' }, context, callback);

        });
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

                assert.equal(body.error, 'Middleware error');
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

                assert.equal(body.error, 'Middleware error');
                done();
            };

            wrap.before(async () => {
                const result = await doAsyncStuff('resolve', false);

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

    });

    describe('finally', () => {
        it('should be called before the callback if set', (done) => {
            let finallyCalls = 0;

            const callback = () => {
                assert.equal(finallyCalls, 1);
                done();
            };

            wrap.finally(() => {
                finallyCalls++;
            });

            const handler = wrap(async () => {
                throw new Error('My Error');
            });

            handler(event, context, callback);
        });

        it('should be able to modify response', (done) => {
            const test = {};

            const callback = (err, res) => {
                assert.strictEqual(res, test);
                done();
            };

            wrap.finally(() => [null, test]);

            const handler = wrap(async () => {
                throw new Error('My Error');
            });

            handler(event, context, callback);
        });
    });

    describe('catch', () => {
        it('should be able to add synchronous catch', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.error, 'Catch error');
                done();
            };

            wrap.catch(() => {
                throw new Error('Catch error');
            });

            const handler = wrap(() => {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should be able to add asynchronous catch', (done) => {
            const callback = (ctx, data) => {
                const body = JSON.parse(data.body);

                assert.equal(body.error, 'Catch error');
                done();
            };

            wrap.catch(async () => {
                const result = await doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('Catch error');
                }
            });

            const handler = wrap(async () => {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should have access to error, event and context objects', (done) => {
            event = { name: 'event' };
            context = { name: 'context' };

            fn = async () => {
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

                assert.equal(body.error, 'Second error');
                done();
            };

            wrap.catch(async () => {
                const result = await doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('First error');
                }
            });

            wrap.catch(async () => {
                const result = await doAsyncStuff('resolve', false);

                if (!result) {
                    throw new Error('Second error');
                }
            });

            const handler = wrap(async () => {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });

        it('should be able to return non error response', (done) => {
            const callback = (ctx, data) => {
                const { statusCode } = data;
                const body = JSON.parse(data.body);

                assert.equal(statusCode, 200);
                assert.equal(body.message, 'Some returned data');
                done();
            };

            wrap.catch(() => ({ statusCode: 200, body: { message: 'Some returned data' } }));

            const handler = wrap(async () => {
                throw new Error('Error');
            });

            handler(event, context, callback);
        });
    });
});
