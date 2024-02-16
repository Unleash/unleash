import { Box, Divider, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReactNode } from 'react';

const StyledBadge = styled(Badge)(({ theme }) => ({
    margin: 'auto',
    marginBottom: theme.spacing(2),
}));

const StyledBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'verticalConnector',
})<{ verticalConnector?: boolean }>(({ theme, verticalConnector }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.elevation1,
    marginTop: verticalConnector ? 0 : theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledVerticalConnector = styled(Divider)(({ theme }) => ({
    margin: 'auto',
    width: 1,
    height: theme.spacing(3),
}));

interface IProjectActionsFormStepProps {
    name: string;
    verticalConnector?: boolean;
    children: ReactNode;
}

export const ProjectActionsFormStep = ({
    name,
    verticalConnector,
    children,
}: IProjectActionsFormStepProps) => (
    <>
        <ConditionallyRender
            condition={Boolean(verticalConnector)}
            show={<StyledVerticalConnector orientation='vertical' />}
        />
        <StyledBox verticalConnector={verticalConnector}>
            <StyledBadge color='secondary'>{name}</StyledBadge>
            {children}
        </StyledBox>
    </>
);
