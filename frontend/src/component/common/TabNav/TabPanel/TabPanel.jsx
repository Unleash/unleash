import React from 'react';
import PropTypes from 'prop-types';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`wrapped-tabpanel-${index}`}
        aria-labelledby={`wrapped-tab-${index}`}
        {...other}
    >
        {value === index && children}
    </div>
);

TabPanel.propTypes = {
    value: PropTypes.number,
    index: PropTypes.number,
    children: PropTypes.object,
};

export default TabPanel;
