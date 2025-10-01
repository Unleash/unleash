import type { FC } from 'react';
import { ColumnsMenu } from '../ColumnsMenu/ColumnsMenu.tsx';
import { formatEnvironmentColumnId } from '../formatEnvironmentColumnId.ts';

type ProjectFeaturesColumnsMenuProps = {
    columnVisibility: Record<string, boolean>;
    environments: string[];
    onToggle: (id: string) => void;
};

export const ProjectFeaturesColumnsMenu: FC<
    ProjectFeaturesColumnsMenuProps
> = ({ columnVisibility, environments, onToggle }) => {
    return (
        <ColumnsMenu
            columns={[
                {
                    header: 'Name',
                    id: 'name',
                    isVisible: columnVisibility.name,
                    isStatic: true,
                },
                {
                    header: 'Created',
                    id: 'createdAt',
                    isVisible: columnVisibility.createdAt,
                },
                {
                    header: 'By',
                    id: 'createdBy',
                    isVisible: columnVisibility.createdBy,
                },
                {
                    header: 'Last seen',
                    id: 'lastSeenAt',
                    isVisible: columnVisibility.lastSeenAt,
                },
                {
                    header: 'Lifecycle',
                    id: 'lifecycle',
                    isVisible: columnVisibility.lifecycle,
                },
                {
                    id: 'divider',
                },
                ...environments.map((environment) => ({
                    header: environment,
                    id: formatEnvironmentColumnId(environment),
                    isVisible:
                        columnVisibility[
                            formatEnvironmentColumnId(environment)
                        ],
                })),
            ]}
            onToggle={onToggle}
        />
    );
};
