import type { FC, SVGProps } from 'react';
import { SvgIcon, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CodeIcon from '@mui/icons-material/Code';
import { ReactComponent as RolloutIcon } from 'assets/icons/rollout.svg';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

export const formatStrategyName = (strategyName: string): string => {
    return formattedStrategyNames[strategyName] ?? strategyName;
};

const RolloutSvgIcon: FC = (props) => (
    <SvgIcon
        {...props}
        component={(rest: SVGProps<SVGSVGElement>) => <RolloutIcon {...rest} />}
        inheritViewBox
    />
);

export const getFeatureStrategyIcon = (strategyName?: string) => {
    switch (strategyName) {
        case 'default':
            return PowerSettingsNewIcon;
        case 'remoteAddress':
            return LanguageIcon;
        case 'flexibleRollout':
            return RolloutSvgIcon;
        case 'applicationHostname':
            return LocationOnIcon;
        case 'releasePlanTemplate':
            return FactCheckOutlinedIcon;
        default:
            return CodeIcon;
    }
};

export const BuiltInStrategies = [
    'default',
    'applicationHostname',
    'flexibleRollout',
    'gradualRolloutRandom',
    'gradualRolloutSessionId',
    'gradualRolloutUserId',
    'remoteAddress',
];

export const GetFeatureStrategyIcon: FC<{ strategyName: string }> = ({
    strategyName,
}) => {
    const theme = useTheme();
    const Icon = getFeatureStrategyIcon(strategyName);
    return <Icon style={{ color: theme.palette.neutral.main }} />;
};

export const formattedStrategyNames: Record<string, string> = {
    applicationHostname: 'Hosts',
    default: 'Standard',
    flexibleRollout: 'Gradual rollout',
    gradualRolloutRandom: 'Randomized',
    gradualRolloutSessionId: 'Sessions',
    gradualRolloutUserId: 'Users',
    remoteAddress: 'IPs',
};
