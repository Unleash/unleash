import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { styled, Tooltip } from '@mui/material';
import { IFeatureStrategy } from 'interfaces/strategy';

interface IFeatureStrategyIconProps {
    strategy: IFeatureStrategy;
}

export const FeatureStrategyIcon = ({
    strategy,
}: IFeatureStrategyIconProps) => {
    const Icon = getFeatureStrategyIcon(strategy.name);

    return (
        <Tooltip
            title={
                formatStrategyName(strategy.name) +
                (strategy.title ? ` - ${strategy.title}` : '')
            }
            arrow
        >
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
    color: theme.palette.action.disabled,

    '& svg': {
        width: theme.spacing(2.5),
        height: theme.spacing(2.5),
    },
}));
