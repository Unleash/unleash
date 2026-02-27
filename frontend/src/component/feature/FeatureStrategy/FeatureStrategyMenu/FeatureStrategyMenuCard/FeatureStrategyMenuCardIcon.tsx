import StrategyDefaultIcon from 'assets/img/strategyDefault.svg?react';
import StrategyGradualIcon from 'assets/img/strategyGradual.svg?react';
import StrategyIPsIcon from 'assets/img/strategyIPs.svg?react';
import StrategyOnIcon from 'assets/img/strategyOn.svg?react';
import ReleaseTemplateIcon from 'assets/img/releaseTemplates.svg?react';
import StrategyHostsIcon from 'assets/img/strategyHosts.svg?react';
import StrategyCustomIcon from 'assets/img/strategyCustom.svg?react';

interface IFeatureStrategyMenuCardIconProps {
    name: string;
}

export const FeatureStrategyMenuCardIcon = ({
    name,
}: IFeatureStrategyMenuCardIconProps) => {
    switch (name) {
        case 'defaultStrategy':
            return <StrategyDefaultIcon />;
        case 'default':
            return <StrategyOnIcon />;
        case 'flexibleRollout':
            return <StrategyGradualIcon />;
        case 'remoteAddress':
            return <StrategyIPsIcon />;
        case 'applicationHostname':
            return <StrategyHostsIcon />;
        case 'releasePlanTemplate':
            return <ReleaseTemplateIcon />;
        default:
            return <StrategyCustomIcon />;
    }
};
