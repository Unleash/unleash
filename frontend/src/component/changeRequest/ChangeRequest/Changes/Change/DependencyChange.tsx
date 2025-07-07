import type { FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
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
import { ChangeItemWrapper as LegacyChangeItemWrapper } from './LegacyStrategyChange.tsx';

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

const AddDependencyWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

/**
 * @deprecated use DependencyChange instead; remove with flag crDiffView
 */
export const LegacyDependencyChange: FC<{
    actions?: ReactNode;
    change: IChangeRequestAddDependency | IChangeRequestDeleteDependency;
    projectId: string;
    onNavigate?: () => void;
}> = ({ actions, change, projectId, onNavigate }) => {
    return (
        <>
            {change.action === 'addDependency' && (
                <>
                    <LegacyChangeItemWrapper>
                        <AddDependencyWrapper>
                            <Typography color={'success.dark'}>
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
                        </AddDependencyWrapper>
                        {actions}
                    </LegacyChangeItemWrapper>
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
