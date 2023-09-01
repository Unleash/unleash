import { openApiTags } from './openapi-tags';

test('no duplicate tags', () => {
    openApiTags.reduce((acc, tag) => {
        expect(acc).not.toContain(tag.name);
        return [...acc, tag.name];
    }, []);
});

test('tags are sorted', () => {
    const tags = openApiTags.map((tag) => tag.name);
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    console.log(tags, sorted);

    expect(tags).toStrictEqual(sorted);
});
