import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Tabs, Tab, Paper } from '@material-ui/core';

import TabPanel from './TabPanel';

import { useStyles } from './styles';
import { useHistory } from 'react-router-dom';

const a11yProps = index => ({
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
});

const TabNav = ({
    tabData,
    className = '',
    navClass = '',
    startingTab = 0,
}) => {
    const styles = useStyles();
    const [activeTab, setActiveTab] = useState(startingTab);
    const history = useHistory();

    const renderTabs = () =>
        tabData.map((tab, index) => (
            <Tab
                key={`${tab.label}_${index}`}
                label={tab.label}
                {...a11yProps(index)}
                onClick={() => history.push(tab.path)}
            />
        ));

    const renderTabPanels = () =>
        tabData.map((tab, index) => (
            <TabPanel
                key={`tab_panel_${index}`}
                value={activeTab}
                index={index}
            >
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

TabNav.propTypes = {
    tabData: PropTypes.array.isRequired,
    className: PropTypes.string,
    startingTab: PropTypes.number,
};

export default TabNav;
