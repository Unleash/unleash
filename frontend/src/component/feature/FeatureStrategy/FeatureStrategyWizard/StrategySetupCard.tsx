import { Box, Button, styled } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ReactNode } from 'react';
import { Badge } from 'component/common/Badge/Badge.tsx';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
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
    width: theme.spacing(5),
    height: theme.spacing(5),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation2,
    '& > svg': {
        width: theme.spacing(3),
        height: theme.spacing(3),
        fill: theme.palette.primary.main,
    },
}));

const StyledName = styled('p')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    flexGrow: 1,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

const StyledAction = styled(Button)(({ theme }) => ({
    alignSelf: 'flex-start',
    marginTop: theme.spacing(2),
    paddingInline: 0,
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
