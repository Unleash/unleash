import React, { useState, ReactNode } from 'react';
import classnames from 'classnames';
import { Tabs, Tab, Paper } from '@material-ui/core';
import { useStyles } from 'component/common/TabNav/TabNav/TabNav.styles';
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
    const styles = useStyles();
    const [activeTab, setActiveTab] = useState(startingTab);

    const renderTabs = () =>
        tabData.map((tab, index) => (
            <Tab
                key={`${tab.label}_${index}`}
                label={tab.label}
                id={`tab-${index}`}
                aria-controls={`tabpanel-${index}`}
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
            <Paper className={classnames(styles.tabNav, navClass)}>
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
