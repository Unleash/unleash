import { FC, ElementType } from 'react';
import { SvgIcon } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import CodeIcon from '@mui/icons-material/Code';
import { ReactComponent as RolloutIcon } from 'assets/icons/rollout.svg';
import { Folder } from '@mui/icons-material';

export const formatStrategyName = (strategyName: string): string => {
    return formattedStrategyNames[strategyName] ?? strategyName;
};

const RolloutSvgIcon: FC = props => (
    <SvgIcon
        {...props}
        component={rest => <RolloutIcon {...rest} />}
        inheritViewBox
    />
);

export const getFeatureStrategyIcon = (strategyName: string): ElementType => {
    switch (strategyName) {
        case 'default':
            return PowerSettingsNewIcon;
        case 'remoteAddress':
            return LanguageIcon;
        case 'flexibleRollout':
            return RolloutSvgIcon;
        case 'userWithId':
            return PeopleIcon;
        case 'withCsAccountId':
            return VerifiedUser;
        case 'withCsProjectId':
            return Folder;
        case 'applicationHostname':
            return LocationOnIcon;
        default:
            return CodeIcon;
    }
};

export const GetFeatureStrategyIcon: FC<{ strategyName: string }> = ({
    strategyName,
}) => {
    const Icon = getFeatureStrategyIcon(strategyName);
    return <Icon />;
};

export const formattedStrategyNames: Record<string, string> = {
    applicationHostname: 'Hosts',
    default: 'Standard',
    flexibleRollout: 'Gradual rollout',
    gradualRolloutRandom: 'Randomized',
    gradualRolloutSessionId: 'Sessions',
    gradualRolloutUserId: 'Users',
    remoteAddress: 'IPs',
    userWithId: 'UserIDs',
    withCsProjectId: 'CS Project IDs',
    withCsAccountId: 'CS Account IDs',
};
