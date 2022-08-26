import { useState } from 'react';

const useTabs = (startingIndex: number = 0) => {
    const [activeTabIdx, setActiveTab] = useState(startingIndex);

    const a11yProps = (index: number) => ({
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    });

    return { activeTabIdx, setActiveTab, a11yProps };
};

export default useTabs;
