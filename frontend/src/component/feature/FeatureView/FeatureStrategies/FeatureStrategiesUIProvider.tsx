import React, { FC, useState } from 'react';
import FeatureStrategiesUIContext from '../../../../contexts/FeatureStrategiesUIContext';
import {
    IFeatureEnvironment,
    IFeatureToggle,
} from '../../../../interfaces/featureToggle';
import { IStrategyPayload } from '../../../../interfaces/strategy';

const FeatureStrategiesUIProvider: FC = ({ children }) => {
    const [configureNewStrategy, setConfigureNewStrategy] =
        useState<IStrategyPayload | null>(null);
    const [activeEnvironment, setActiveEnvironment] =
        useState<IFeatureEnvironment | null>(null);
    const [expandedSidebar, setExpandedSidebar] = useState(false);
    const [featureCache, setFeatureCache] = useState<IFeatureToggle | null>(
        null
    );
    const [dirty, setDirty] = useState({});
    const context = {
        configureNewStrategy,
        setConfigureNewStrategy,
        setActiveEnvironment,
        activeEnvironment,
        expandedSidebar,
        setExpandedSidebar,
        featureCache,
        setFeatureCache,

        setDirty,
        dirty,
    };

    return (
        <FeatureStrategiesUIContext.Provider value={context}>
            {children}
        </FeatureStrategiesUIContext.Provider>
    );
};

export default FeatureStrategiesUIProvider;
