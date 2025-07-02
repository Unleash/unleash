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

const AddDependencyText = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
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
                            <Typography
                                component='span'
                                color={'success.dark'}
                                // sx={{ display: 'inline' }}
                            >
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
                        </ChangeItemInfo>
                        {actions}
                    </ChangeItemWrapper>
                </>
            )}
            {change.action === 'deleteDependency' && (
                <ChangeItemWrapper>
                    <AddDependencyWrapper>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.error.main,
                            })}
                        >
                            - Deleting dependencies
                        </Typography>
                    </AddDependencyWrapper>
                    {actions}
                </ChangeItemWrapper>
            )}
        </>
    );
};
