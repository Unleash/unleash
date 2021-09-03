import * as unleash from './lib/server-impl';

try {
    unleash.start();
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
