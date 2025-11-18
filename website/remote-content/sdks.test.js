import { docs } from './services';

test('Should get all sub pages', () => {
    expect(docs.urls).toStrictEqual([
        'unleash-proxy/main/README.md',
        'unleash-edge/main/README.md',
        'unleash-edge/main/docs/concepts.md',
        'unleash-edge/main/docs/deploying.md',
    ]);
});

test('Modifies filenames and content properly', () => {
    const proxyContent = docs.modifyContent(docs.urls[0], '');
    const edgeMainContent = docs.modifyContent(docs.urls[1], '');
    const firstSubpage = docs.modifyContent(docs.urls[2], '');
    const secondSubpage = docs.modifyContent(docs.urls[3], '');

    expect(proxyContent.filename).toBe('unleash-proxy.md');
    expect(edgeMainContent.filename).toBe('unleash-edge.md');
    expect(firstSubpage.filename).toBe('unleash-edge/concepts.md');
    expect(secondSubpage.filename).toBe('unleash-edge/deploying.md');

    expect(edgeMainContent.content).toContain('title: Unleash Edge');
    expect(edgeMainContent.content).toContain('slug: /reference/unleash-edge');
    expect(edgeMainContent.content).toContain(
        'custom_edit_url: https://github.com/Unleash/unleash-edge/edit/main/README.md',
    );

    expect(firstSubpage.content).toContain('title: Concepts');
    expect(firstSubpage.content).toContain(
        'slug: /reference/unleash-edge/concepts',
    );
    expect(firstSubpage.content).toContain(
        'custom_edit_url: https://github.com/Unleash/unleash-edge/edit/main/docs/concepts.md',
    );
});
