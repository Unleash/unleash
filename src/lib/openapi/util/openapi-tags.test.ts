import { openApiTags } from './openapi-tags';

test('no duplicate tags', () => {
    openApiTags.reduce((acc, tag) => {
        expect(acc).not.toContain(tag.name);
        return [...acc, tag.name];
    }, []);
});
