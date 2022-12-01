import { styled } from '@mui/material';
import { VerticalTab } from './VerticalTab/VerticalTab';
import { ITooltipResolverProps } from '../TooltipResolver/TooltipResolver';

const StyledTabPage = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledTabPageContent = styled('div')(() => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledTabs = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: theme.spacing(30),
    flexShrink: 0,
    [theme.breakpoints.down('md')]: {
        width: '100%',
    },
}));

export interface ITab {
    id: string;
    label: string;
    path?: string;
    hidden?: boolean;
    disabled?: boolean;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
}

interface IVerticalTabsProps {
    tabs: ITab[];
    value: string;
    onChange: (tab: ITab) => void;
    children: React.ReactNode;
}

export const VerticalTabs = ({
    tabs,
    value,
    onChange,
    children,
}: IVerticalTabsProps) => (
    <StyledTabPage>
        <StyledTabs>
            {tabs
                .filter(tab => !tab.hidden)
                .map(tab => (
                    <VerticalTab
                        key={tab.id}
                        label={tab.label}
                        selected={tab.id === value}
                        disabled={tab.disabled}
                        onClick={() => onChange(tab)}
                        tooltipProps={tab.tooltipProps}
                    />
                ))}
        </StyledTabs>
        <StyledTabPageContent>{children}</StyledTabPageContent>
    </StyledTabPage>
);
