import React, { useState, ReactNode } from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import { TabPanel } from 'component/common/TabNav/TabPanel/TabPanel';

interface ITabNavProps {
    tabData: ITabData[];
    className?: string;
    navClass?: string;
    startingTab?: number;
}

interface ITabData {
    label: string;
    component: ReactNode;
}

export const TabNav = ({
    tabData,
    className = '',
    navClass = '',
    startingTab = 0,
}: ITabNavProps) => {
    const [activeTab, setActiveTab] = useState(startingTab);
    const renderTabs = () =>
        tabData.map((tab, index) => (
            <Tab
                key={`${tab.label}_${index}`}
                label={tab.label}
                id={`tab-${index}`}
                aria-controls={`tabpanel-${index}`}
                sx={{
                    minWidth: {
                        lg: 160,
                    },
                }}
            />
        ));

    const renderTabPanels = () =>
        tabData.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
                {tab.component}
            </TabPanel>
        ));

    return (
        <>
            <Paper
                className={navClass}
                elevation={0}
                sx={{
                    backgroundColor: theme => theme.palette.background.paper,
                    borderBottom: '1px solid',
                    borderBottomColor: theme => theme.palette.divider,
                    borderRadius: 0,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, tabId) => {
                        setActiveTab(tabId);
                    }}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    {renderTabs()}
                </Tabs>
            </Paper>
            <div className={className}>{renderTabPanels()}</div>
        </>
    );
};
