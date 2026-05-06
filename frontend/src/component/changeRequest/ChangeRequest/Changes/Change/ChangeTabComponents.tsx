import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Button, type ButtonProps, styled } from '@mui/material';
import type { PropsWithChildren } from 'react';

const StyledTabList = styled(BaseTabs.List)(({ theme }) => ({
    display: 'inline-flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
}));

export const TabList = ({ children }: PropsWithChildren) => (
    <StyledTabList activateOnFocus>{children}</StyledTabList>
);

const StyledButton = styled(Button)(({ theme }) => ({
    '&[aria-selected="true"]': {
        background: theme.palette.background.elevation1,
    },
}));

export const Tab = ({
    children,
    value,
    ...rest
}: ButtonProps & { value: 'change' | 'diff' }) => (
    <BaseTabs.Tab
        value={value}
        render={({ color: _color, ...props }) => (
            <StyledButton {...props} {...rest}>
                {children}
            </StyledButton>
        )}
    />
);

export const Tabs = ({
    className,
    children,
}: PropsWithChildren<{ className?: string }>) => (
    <BaseTabs.Root
        aria-label='View rendered change or JSON diff'
        defaultValue='change'
        className={className}
    >
        {children}
    </BaseTabs.Root>
);

export const TabPanel = styled(BaseTabs.Panel)<{
    value: 'change' | 'diff';
}>(({ theme, value }) =>
    value === 'diff'
        ? {
              padding: theme.spacing(2),
              borderRadius: theme.shape.borderRadiusLarge,
              border: `1px solid ${theme.palette.divider}`,
          }
        : {},
);
