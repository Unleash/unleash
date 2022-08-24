import React, { ReactNode } from 'react';

interface ITabPanelProps {
    value: number;
    index: number;
    children: ReactNode;
}

export const TabPanel = ({ children, value, index }: ITabPanelProps) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
    >
        {value === index && children}
    </div>
);
