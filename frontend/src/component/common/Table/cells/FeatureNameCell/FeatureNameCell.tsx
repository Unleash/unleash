import type { VFC } from 'react';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';

interface IFeatureNameCellProps {
    row: {
        original: {
            name?: string | null;
            description?: string | null;
            project?: string | null;
        };
    };
}

export const FeatureNameCell: VFC<IFeatureNameCellProps> = ({ row }) => (
    <LinkCell
        title={row.original.name || ''}
        subtitle={row.original.description || ''}
        to={
            row.original.project && row.original.name
                ? `/projects/${row.original.project}/features/${row.original.name}`
                : undefined
        }
    />
);
