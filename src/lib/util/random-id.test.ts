import { randomId } from './random-id.js';

test('randomId returns a valid UUID', () => {
    const id = randomId();
    console.log(id);
    expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
});
