import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import type {
    IChangeRequestAddDependency,
    IChangeRequestDeleteDependency,
} from 'component/changeRequest/changeRequest.types';
import { Link } from 'react-router-dom';
import {
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles';

const StyledLink = styled(Link)(({ theme }) => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const DependencyChange: FC<{
    actions?: ReactNode;
    change: IChangeRequestAddDependency | IChangeRequestDeleteDependency;
    projectId: string;
    onNavigate?: () => void;
}> = ({ actions, change, projectId, onNavigate }) => {
    if (change.action === 'addDependency') {
        return (
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Added>Adding dependency</Added>
                    <StyledLink
                        to={`/projects/${projectId}/features/${change.payload.feature}`}
                        onClick={onNavigate}
                    >
                        {change.payload.feature}
                    </StyledLink>
                    {!change.payload.enabled ? ' (disabled)' : null}
                    {change.payload.variants?.length
                        ? `(${change.payload.variants?.join(', ')})`
                        : null}
                    {actions}
                </ChangeItemInfo>
            </ChangeItemWrapper>
        );
    }

    if (change.action === 'deleteDependency') {
        return (
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Deleted>Deleting dependencies</Deleted>
                    {actions}
                </ChangeItemInfo>
            </ChangeItemWrapper>
        );
    }
};
