import {
    Tab as MuiTab,
    TabPanel as MuiTabPanel,
    Tabs as MuiTabs,
    TabsList as MuiTabsList,
} from '@mui/base';
import { Button, type ButtonProps, styled } from '@mui/material';
import type { PropsWithChildren } from 'react';

export const TabList = styled(MuiTabsList)(({ theme }) => ({
    display: 'inline-flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
    '&[aria-selected="true"]': {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        background: theme.palette.background.elevation1,
    },
}));

export const Tab = styled(({ children }: ButtonProps) => (
    <MuiTab slots={{ root: StyledButton }}>{children}</MuiTab>
))(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.5),
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    padding: theme.spacing(0.75, 1),
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    background: theme.palette.background.application,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    zIndex: theme.zIndex.fab,
    textTransform: 'uppercase',
}));

export const Tabs = ({
    className,
    children,
}: PropsWithChildren<{ className?: string }>) => (
    <MuiTabs
        aria-label='View rendered change or JSON diff'
        selectionFollowsFocus
        defaultValue={0}
        className={className}
    >
        {children}
    </MuiTabs>
);

export const TabPanel = styled(MuiTabPanel, {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'diff' | 'change' }>(({ theme, variant }) =>
    variant === 'diff'
        ? {
              padding: theme.spacing(2),
              borderRadius: theme.shape.borderRadiusLarge,
              border: `1px solid ${theme.palette.divider}`,
          }
        : {},
);
