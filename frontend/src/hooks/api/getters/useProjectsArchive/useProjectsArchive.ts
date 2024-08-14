import type { ProjectSchema } from 'openapi';

// FIXME: import tpye
interface IProjectArchiveCard {
    name: string;
    id: string;
    createdAt: string;
    archivedAt: string;
    description: string;
    featureCount: number;
    owners?: ProjectSchema['owners'];
}

// TODO: implement data fetching
const useProjectsArchive = () => {
    return {
        projects: [
            {
                name: 'Archived something',
                id: 'archi',
                createdAt: new Date('2024-08-10 16:06').toISOString(),
                archivedAt: new Date('2024-08-12 17:07').toISOString(),
                owners: [{ ownerType: 'system' }],
            },
            {
                name: 'Second example',
                id: 'pid',
                createdAt: new Date('2024-08-10 16:06').toISOString(),
                archivedAt: new Date('2024-08-12 17:07').toISOString(),
                owners: [{ ownerType: 'system' }],
            },
        ],
        error: undefined as any,
        loading: false,
        refetch: () => {},
    };
};

export default useProjectsArchive;
