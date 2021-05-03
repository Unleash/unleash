import { rewriteHTML } from './rewriteHTML';
import test from 'ava';

const input = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="baseUriPath" content="::baseUriPath::" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="unleash" />

        <title>Unleash - Enterprise ready feature toggles</title>
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
        />
        <link
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
            rel="stylesheet"
        />
    </head>
    <body>
        <div id="app"></div>
    </body>
    <script src="/static/js/2.5ff09a33.chunk.js"></script>
    <script src="/static/js/main.6bcf6c41.chunk.js"></script>
</html>`;

test('rewriteHTML substitutes meta tag with existing rewrite value', t => {
    const result = rewriteHTML(input, '/hosted');
    t.true(result.includes(`<meta name="baseUriPath" content="/hosted" />`));
});

test('rewriteHTML substitutes meta tag with empty value', t => {
    const result = rewriteHTML(input, '');
    t.true(result.includes(`<meta name="baseUriPath" content="" />`));
});

test('rewriteHTML substitutes asset paths correctly with baseUriPath', t => {
    const result = rewriteHTML(input, '/hosted');
    t.true(
        result.includes(
            `<script src="/hosted/static/js/2.5ff09a33.chunk.js"></script>`,
        ),
    );
    t.true(
        result.includes(
            ` <script src="/hosted/static/js/main.6bcf6c41.chunk.js"></script>`,
        ),
    );
});

test('rewriteHTML substitutes asset paths correctly without baseUriPath', t => {
    const result = rewriteHTML(input, '');
    t.true(
        result.includes(
            `<script src="/static/js/2.5ff09a33.chunk.js"></script>`,
        ),
    );
    t.true(
        result.includes(
            ` <script src="/static/js/main.6bcf6c41.chunk.js"></script>`,
        ),
    );
});
