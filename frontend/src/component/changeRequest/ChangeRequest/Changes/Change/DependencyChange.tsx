import type { FC, ReactNode } from 'react';
import { styled, Typography } from '@mui/material';
import type {
    IChangeRequestAddDependency,
    IChangeRequestDeleteDependency,
} from 'component/changeRequest/changeRequest.types';
import { Link } from 'react-router-dom';
import { ChangeItemInfo, ChangeItemWrapper } from './Change.styles';

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
    return (
        <>
            {change.action === 'addDependency' && (
                <>
                    <ChangeItemWrapper>
                        <ChangeItemInfo>
                            <Typography component='span' color={'success.dark'}>
                                + Adding dependency
                            </Typography>
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
                </>
            )}
            {change.action === 'deleteDependency' && (
                <ChangeItemWrapper>
                    <ChangeItemInfo>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.error.main,
                            })}
                            component='span'
                            display='inline'
                        >
                            - Deleting dependencies
                        </Typography>
                        {actions}
                    </ChangeItemInfo>
                </ChangeItemWrapper>
            )}
        </>
    );
};
