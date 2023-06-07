import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { styled } from '@mui/material';
import IRole from 'interfaces/role';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

interface IRolesCellProps {
    role: IRole;
}

export const RolesCell = ({ role }: IRolesCellProps) => (
    <HighlightCell
        value={role.name}
        subtitle={role.description}
        afterTitle={
            <ConditionallyRender
                condition={role.type === 'root'}
                show={<StyledBadge color="success">Predefined</StyledBadge>}
            />
        }
    />
);
