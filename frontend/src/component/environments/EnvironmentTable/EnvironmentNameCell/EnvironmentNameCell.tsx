import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IEnvironment } from 'interfaces/environments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { styled } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

interface IEnvironmentNameCellProps {
    environment: IEnvironment;
}

export const EnvironmentNameCell = ({
    environment,
}: IEnvironmentNameCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <TextCell>
            <Highlighter search={searchQuery}>{environment.name}</Highlighter>
            <ConditionallyRender
                condition={!environment.enabled}
                show={<StyledBadge color="warning">Disabled</StyledBadge>}
            />
            <ConditionallyRender
                condition={environment.protected}
                show={<StyledBadge color="success">Predefined</StyledBadge>}
            />
        </TextCell>
    );
};
