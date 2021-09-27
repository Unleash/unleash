import { useState } from 'react';

const useTabs = (startingIndex: number = 0) => {
    const [activeTab, setActiveTab] = useState(startingIndex);

    const a11yProps = (index: number) => ({
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    });

    return { activeTab, setActiveTab, a11yProps };
};

export default useTabs;
