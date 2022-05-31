import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { styled, Tooltip } from '@mui/material';
import { useId } from 'hooks/useId';

interface IFeatureStrategyIconProps {
    strategyName: string;
}

export const FeatureStrategyIcon = ({
    strategyName,
}: IFeatureStrategyIconProps) => {
    const Icon = getFeatureStrategyIcon(strategyName);
    const id = useId();

    return (
        <StyledIcon>
            <Tooltip title={formatStrategyName(strategyName)} arrow>
                <div id={id} role="tooltip">
                    <Icon aria-labelledby={id} />
                </div>
            </Tooltip>
        </StyledIcon>
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
