import { Box, Button, styled } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ReactNode } from 'react';
import { Badge } from 'component/common/Badge/Badge.tsx';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledIcon = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.default,
    '& > svg': {
        width: theme.spacing(3),
        height: theme.spacing(3),
        fontSize: theme.spacing(3),
        color: theme.palette.primary.main,
    },
}));

const StyledName = styled('p')(({ theme }) => ({
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    flexGrow: 1,
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
}));

const StyledAction = styled(Button)(({ theme }) => ({
    alignSelf: 'flex-start',
    marginTop: theme.spacing(2),
    paddingInline: 0,
    fontSize: theme.typography.button.fontSize,
}));

interface IStrategySetupCardProps {
    name: string;
    description: ReactNode;
    icon: ReactNode;
    badge?: string;
    actionLabel: string;
    actionDisabled?: boolean;
    onAction: () => void;
}

export const StrategySetupCard = ({
    name,
    description,
    icon,
    badge,
    actionLabel,
    actionDisabled,
    onAction,
}: IStrategySetupCardProps) => (
    <StyledCard>
        <StyledHeader>
            <StyledIcon>{icon}</StyledIcon>
            {badge ? <Badge>{badge}</Badge> : null}
        </StyledHeader>
        <StyledName>{name}</StyledName>
        <StyledDescription>{description}</StyledDescription>
        <StyledAction
            variant='text'
            size='medium'
            endIcon={<ChevronRightIcon />}
            disabled={actionDisabled}
            onClick={onAction}
        >
            {actionLabel}
        </StyledAction>
    </StyledCard>
);
