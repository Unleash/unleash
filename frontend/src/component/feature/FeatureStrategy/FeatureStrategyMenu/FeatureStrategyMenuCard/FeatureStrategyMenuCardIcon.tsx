import { ReactComponent as StrategyDefaultIcon } from 'assets/img/strategyDefault.svg';
import { ReactComponent as StrategyGradualIcon } from 'assets/img/strategyGradual.svg';
import { ReactComponent as StrategyIPsIcon } from 'assets/img/strategyIPs.svg';
import { ReactComponent as StrategyOnIcon } from 'assets/img/strategyOn.svg';
import { ReactComponent as ReleaseTemplateIcon } from 'assets/img/releaseTemplates.svg';
import { ReactComponent as StrategyHostsIcon } from 'assets/img/strategyHosts.svg';
import { ReactComponent as StrategyCustomIcon } from 'assets/img/strategyCustom.svg';

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
