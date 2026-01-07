import type { ProjectSchema } from 'openapi';
import { groupProjects } from './group-projects.js';

test('should check that the project is a user project OR that it is a favorite', () => {
    const myProjectIds = new Set(['my1', 'my2', 'my3']);

    const projects: ProjectSchema[] = [
        { id: 'my1', favorite: true },
        { id: 'my2', favorite: false },
        { id: 'my3' },
        { id: 'fave-but-not-mine', favorite: true },
        { id: 'not-mine-not-fave', favorite: false },
        { id: 'not-mine-undefined-fave' },
    ].map(({ id, favorite }) => ({
        name: 'name',
        id,
        createdAt: '2024-04-15T11:09:52+02:00',
        health: 100,
        description: 'description',
        featureCount: 100,
        mode: 'open',
        memberCount: 10,
        favorite,
    }));

    const { myProjects, otherProjects } = groupProjects(myProjectIds, projects);

    expect(myProjects).toMatchObject([
        { id: 'my1' },
        { id: 'my2' },
        { id: 'my3' },
        { id: 'fave-but-not-mine' },
    ]);
    expect(otherProjects).toMatchObject([
        { id: 'not-mine-not-fave' },
        { id: 'not-mine-undefined-fave' },
    ]);
});
