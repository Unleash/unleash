import { start } from './lib/server-impl.js';

try {
    await start();
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
