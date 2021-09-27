import React from 'react';
import { IFeatureEnvironment } from '../interfaces/featureToggle';
import { IStrategyPayload } from '../interfaces/strategy';

interface IFeatureStrategiesUIContext {
    configureNewStrategy: IStrategyPayload | null;
    setConfigureNewStrategy: React.Dispatch<
        React.SetStateAction<IStrategyPayload | null>
    >;
    setActiveEnvironment: React.Dispatch<
        React.SetStateAction<IFeatureEnvironment | null>
    >;
    activeEnvironment: IFeatureEnvironment | null;
    expandedSidebar: boolean;
    setExpandedSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const FeatureStrategiesUIContext =
    React.createContext<IFeatureStrategiesUIContext | null>(null);

export default FeatureStrategiesUIContext;
