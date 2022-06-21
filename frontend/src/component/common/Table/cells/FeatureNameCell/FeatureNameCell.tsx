import { VFC } from 'react';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';

interface IFeatureNameCellProps {
    row: {
        original: {
            name: string;
            description: string;
            project: string;
        };
    };
}

export const FeatureNameCell: VFC<IFeatureNameCellProps> = ({ row }) => (
    <LinkCell
        title={row.original.name}
        subtitle={row.original.description}
        to={`/projects/${row.original.project}/features/${row.original.name}`}
    />
);
