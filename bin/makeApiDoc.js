
'use strict';

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, '..', 'README.md');

const readme = fs.readFileSync(filename, 'utf8');

const separator = '\n-----------------\n\n# API\n';
const beginning = readme.split(separator)[0];

const apiDoc = jsdoc2md.renderSync({
    'example-lang': 'javascript',
    files: [
        'lib/lambdaWrap.js',
        'lib/response.js',
        'lib/errorResponse.js',
        'lib/error.js'
    ]
});

console.log(apiDoc); // eslint-disable-line no-console

fs.writeFileSync(filename, `${beginning}${separator}${apiDoc}`);
