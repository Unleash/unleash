import fs from 'fs';
import { rewriteHTML } from './rewriteHTML.js';
import path from 'path';
import ky from 'ky';
import type { IUnleashConfig } from '../types/index.js';

export async function loadIndexHTML(
    config: IUnleashConfig,
    publicFolder: string,
): Promise<string> {
    const { cdnPrefix, baseUriPath = '' } = config.server;
    const uiFlags = encodeURI(JSON.stringify(config.ui.flags || '{}'));
    const unleashToken = config.unleashFrontendToken;

    let indexHTML: string;
    if (cdnPrefix) {
        const res = await ky.get(`${cdnPrefix}/index.html`);
        indexHTML = await res.text();
    } else {
        indexHTML = fs
            .readFileSync(
                path.join(config.publicFolder || publicFolder, 'index.html'),
            )
            .toString();
    }

    return rewriteHTML(
        indexHTML,
        baseUriPath,
        cdnPrefix,
        uiFlags,
        unleashToken,
    );
}
