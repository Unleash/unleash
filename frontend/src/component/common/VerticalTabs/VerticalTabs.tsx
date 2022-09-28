import { styled } from '@mui/material';
import { VerticalTab } from './VerticalTab/VerticalTab';

const StyledTabs = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

interface ITab {
    id: string;
    label: string;
}

interface IVerticalTabsProps {
    tabs: ITab[];
    value: string;
    onChange: (value: string) => void;
}

export const VerticalTabs = ({ tabs, value, onChange }: IVerticalTabsProps) => (
    <StyledTabs>
        {tabs.map(tab => (
            <VerticalTab
                key={tab.id}
                label={tab.label}
                selected={tab.id === value}
                onClick={() => onChange(tab.id)}
            />
        ))}
    </StyledTabs>
);
