import { start } from './lib/server-impl';

try {
    start();
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
