import { openApiTags } from './openapi-tags.js';

test('no duplicate tags', () => {
    openApiTags.reduce((acc, tag) => {
        expect(acc).not.toContain(tag.name);
        return [...acc, tag.name];
    }, []);
});

test('The list of OpenAPI tags is sorted', () => {
    const tags = openApiTags.map((tag) => tag.name);
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));

    expect(tags).toStrictEqual(sorted);
});
