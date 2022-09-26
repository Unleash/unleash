import * as unleash from './lib/server-impl';

try {
    unleash.start();
    console.log('Unleash started', 'Do not merge this change, it is just to test https://github.com/Unleash/unleash/pull/2087');
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
