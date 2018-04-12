
class ServerlessLambdaEvent {
    resource: string
    path: string
    httpMethod: string
    headers: Object
    queryStringParameters: null | Object
    pathParameters: null | Objec
    stageVariables: null | Object
    requestContext: {
        path: string
        accountId: string
        resourceId: string
        stage: string
        requestId: string
        identity: {
            cognitoIdentityPoolId: null
            accountId: null
            cognitoIdentityId: null
            caller: null
            apiKey: string
            sourceIp: string
            accessKey: null
            cognitoAuthenticationType: null
            cognitoAuthenticationProvider: null
            userArn: null
            userAgent: string
            user: null
        },
        resourcePath: string
        httpMethod: string
        apiId: string
    },
    body: string
    isBase64Encoded: false
    verbose: boolean
}

interface LambdaWrapOptions {
    headers?: object
    verboseError?: boolean
    verboseLog?: boolean
    callbackWaitsForEmptyEventLoop?: boolean
}

function lambdaHandler (event: Object, context: Object, callback: Function): void

interface wrapperFunctionType { (event: ServerlessLambdaEvent, context: Object): any }
interface Logger {
    log (...args:any[]): any
    error (...args:any[]): any
    warn (...args:any[]): any
}

interface responseHandlerType { (data: Object, event: ServerlessLambdaEvent, context: Object, callback: Function, logger?: Logger, options?: LambdaWrapOptions): any }
interface errorResponseHandlerType { (error: Error, event: ServerlessLambdaEvent, context: Object, callback: Function, logger?: Logger, options?: LambdaWrapOptions): any }

interface beforeMiddlewareType { (event: ServerlessLambdaEvent, context?: Object): any }
interface catchMiddlewareType { (error: Error, event?: ServerlessLambdaEvent, context?: Object): any }
interface finallyMiddlewareType { (error?: Error, response?: Object, event?: ServerlessLambdaEvent, context?: Object): any }

interface wrapFn {
    (wrapperFunction: wrapperFunctionType): lambdaHandler

    logger: Logger

    responseHandler: responseHandler
    errorResponseHandler: responseHandler

    before (beforeMiddleware: beforeMiddlewareType): void
    catch (catchMiddleware: catchMiddlewareType): void
    finally (finallyMiddleware: finallyMiddlewareType): void
};

export function lambdaWrap(options: LambdaWrapOptions): wrapFn;
