import { withFallback } from './withFallback';

test('use fallback', () => {
    const fn = withFallback(true)(() => 'expensive value', 'fallback');
    expect(fn()).toEqual('fallback');
});

test('use original fn', () => {
    const fn = withFallback(false)(() => 'expensive value', 'fallback');
    expect(fn()).toEqual('expensive value');
});
