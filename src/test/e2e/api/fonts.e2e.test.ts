import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app: IUnleashTest;
let db: ITestDb;
let publicFolder: string;

beforeAll(async () => {
    // loadIndexHTML requires an index.html in publicFolder and serve-favicon
    // stats favicon.ico at startup, so use a temp folder that holds both plus
    // a copy of the committed Sen stylesheet.
    publicFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'unleash-fonts-'));
    fs.writeFileSync(
        path.join(publicFolder, 'index.html'),
        '<!doctype html><html><head></head><body></body></html>',
    );
    fs.copyFileSync(
        path.join(__dirname, '../../../../frontend/public/favicon.ico'),
        path.join(publicFolder, 'favicon.ico'),
    );
    const fontDir = path.join(publicFolder, 'fonts', 'sen', 'v1');
    fs.mkdirSync(fontDir, { recursive: true });
    fs.copyFileSync(
        path.join(
            __dirname,
            '../../../../frontend/public/fonts/sen/v1/sen.css',
        ),
        path.join(fontDir, 'sen.css'),
    );

    db = await dbInit('fonts_api', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        { publicFolder },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app?.destroy();
    await db?.destroy();
    fs.rmSync(publicFolder, { recursive: true, force: true });
});

test('serves the self-hosted Sen stylesheet with an immutable cache policy', async () => {
    const res = await app.request
        .get('/fonts/sen/v1/sen.css')
        .expect('Content-Type', /text\/css/)
        .expect(200);

    expect(res.headers['cache-control']).toContain('immutable');
    expect(res.text).toContain('src:');
    expect(res.text).toContain('sen-variable.woff2');
});
