import type * as React from 'react';
import type { ReactNode } from 'react';
import {
    IconButton,
    ListItemButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { Truncator } from 'component/common/Truncator/Truncator';

const StyledItemButton = styled(ListItemButton)(({ theme }) => ({
    outline: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'start',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
    '& > svg': {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
}));

const LabelWithSummary = styled('div')(({ theme }) => ({
    flex: 1,
}));

const StyledItemButtonClose = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.25),
}));

const StyledItemTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    height: theme.spacing(3),
}));

interface NewInUnleashSideBarItemProps {
    label: string;
    summary: string;
    icon: ReactNode;
    beta?: boolean;
    onDismiss: (e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent) => void;
}

export const NewInUnleashSideBarItem = ({
    icon,
    label,
    summary,
    beta = false,
    onDismiss,
    onClick,
}: NewInUnleashSideBarItemProps) => {
    return (
        <StyledItemButton onClick={onClick}>
            {icon}
            <LabelWithSummary>
                <StyledItemTitle>
                    <Typography fontWeight='bold' fontSize='small'>
                        <Truncator title={label} arrow>
                            {label}
                        </Truncator>
                    </Typography>
                    <ConditionallyRender
                        condition={beta}
                        show={<Badge color='secondary'>Beta</Badge>}
                    />
                </StyledItemTitle>
                <Typography fontSize='small'>{summary}</Typography>
            </LabelWithSummary>
            <Tooltip title='Dismiss' arrow sx={{ marginLeft: 'auto' }}>
                <StyledItemButtonClose
                    aria-label='dismiss'
                    onClick={onDismiss}
                    size='small'
                >
                    <Close fontSize='inherit' />
                </StyledItemButtonClose>
            </Tooltip>
        </StyledItemButton>
    );
};
