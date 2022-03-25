import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleIcon from '@material-ui/icons/People';
import LanguageIcon from '@material-ui/icons/Language';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import RolloutIcon from 'component/common/RolloutIcon/RolloutIcon';
import { ElementType } from 'react';

export const formatStrategyName = (strategyName: string): string => {
    return formattedStrategyNames[strategyName] ?? strategyName;
};

export const getFeatureStrategyIcon = (strategyName: string): ElementType => {
    switch (strategyName) {
        case 'remoteAddress':
            return LanguageIcon;
        case 'flexibleRollout':
            return RolloutIcon;
        case 'userWithId':
            return PeopleIcon;
        case 'applicationHostname':
            return LocationOnIcon;
        default:
            return PowerSettingsNewIcon;
    }
};

const formattedStrategyNames: Record<string, string> = {
    applicationHostname: 'Hosts',
    default: 'Standard',
    flexibleRollout: 'Gradual rollout',
    gradualRolloutRandom: 'Randomized',
    gradualRolloutSessionId: 'Sessions',
    gradualRolloutUserId: 'Users',
    remoteAddress: 'IPs',
    userWithId: 'UserIDs',
};
