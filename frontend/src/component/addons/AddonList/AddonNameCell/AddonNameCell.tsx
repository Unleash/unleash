import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { IAddonProvider } from 'interfaces/addons';

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

interface IAddonNameCellProps {
    provider: Pick<
        IAddonProvider,
        'displayName' | 'description' | 'deprecated'
    >;
}

export const AddonNameCell = ({ provider }: IAddonNameCellProps) => (
    <HighlightCell
        value={provider.displayName}
        subtitle={provider.description}
        afterTitle={
            <ConditionallyRender
                condition={Boolean(provider.deprecated)}
                show={<StyledBadge color="neutral">Deprecated</StyledBadge>}
            />
        }
    />
);
