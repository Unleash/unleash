import { styled } from '@mui/material';
import { VerticalTab } from './VerticalTab/VerticalTab.tsx';
import type { HTMLAttributes } from 'react';

const StyledTabPage = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    [theme.breakpoints.down('xl')]: {
        flexDirection: 'column',
    },
}));

const StyledTabPageContent = styled('div')(() => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledTabs = styled('div', {
    shouldForwardProp: (prop) => prop !== 'fullWidth',
})<{ fullWidth?: boolean }>(({ theme, fullWidth }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: fullWidth ? '100%' : theme.spacing(30),
    flexShrink: 0,
    [theme.breakpoints.down('xl')]: {
        width: '100%',
    },
}));

export interface ITab {
    id: string;
    label: string;
    description?: string;
    path?: string;
    hidden?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

interface IVerticalTabsProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
    tabs: ITab[];
    value: string;
    onChange: (tab: ITab) => void;
    children?: React.ReactNode;
}

export const VerticalTabs = ({
    tabs,
    value,
    onChange,
    children,
    ...props
}: IVerticalTabsProps) => {
    const verticalTabs = tabs
        .filter((tab) => !tab.hidden)
        .map((tab) => (
            <VerticalTab
                key={tab.id}
                label={tab.label}
                description={tab.description}
                selected={tab.id === value}
                onClick={() => onChange(tab)}
                startIcon={tab.startIcon}
                endIcon={tab.endIcon}
            />
        ));

    if (!children) {
        return (
            <StyledTabs fullWidth {...props}>
                {verticalTabs}
            </StyledTabs>
        );
    }
    return (
        <StyledTabPage>
            <StyledTabs {...props}>{verticalTabs}</StyledTabs>
            <StyledTabPageContent>{children}</StyledTabPageContent>
        </StyledTabPage>
    );
};
