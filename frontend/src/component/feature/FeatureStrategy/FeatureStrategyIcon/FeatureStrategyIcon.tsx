import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { styled, Tooltip } from '@mui/material';

interface IFeatureStrategyIconProps {
    strategyName: string;
}

export const FeatureStrategyIcon = ({
    strategyName,
}: IFeatureStrategyIconProps) => {
    const Icon = getFeatureStrategyIcon(strategyName);

    return (
        <Tooltip title={formatStrategyName(strategyName)} arrow>
            <StyledIcon>
                <Icon />
            </StyledIcon>
        </Tooltip>
    );
};

const StyledIcon = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.inactiveIcon,

    '& svg': {
        width: theme.spacing(2.5),
        height: theme.spacing(2.5),
    },
}));
