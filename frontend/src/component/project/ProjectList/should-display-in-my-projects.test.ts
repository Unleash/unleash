import type { IProjectCard } from 'interfaces/project';
import { shouldDisplayInMyProjects } from './should-display-in-my-projects';

test('should check that the project is a user project OR that it is a favorite', () => {
    const myProjects = new Set(['my1', 'my2', 'my3']);

    const projects: IProjectCard[] = [
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

    const filtered = projects.filter(shouldDisplayInMyProjects(myProjects));

    expect(filtered).toMatchObject([
        { id: 'my1' },
        { id: 'my2' },
        { id: 'my3' },
        { id: 'fave-but-not-mine' },
    ]);
});
