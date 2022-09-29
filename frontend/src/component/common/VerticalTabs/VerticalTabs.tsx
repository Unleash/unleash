import { styled } from '@mui/material';
import { VerticalTab } from './VerticalTab/VerticalTab';

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
    flexShrink: 0,
}));

export interface ITab {
    id: string;
    label: string;
    path?: string;
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
            {tabs.map(tab => (
                <VerticalTab
                    key={tab.id}
                    label={tab.label}
                    selected={tab.id === value}
                    onClick={() => onChange(tab)}
                />
            ))}
        </StyledTabs>
        <StyledTabPageContent>{children}</StyledTabPageContent>
    </StyledTabPage>
);
