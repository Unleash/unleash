import { styled } from '@mui/material';
import type { StrategyFormParameters } from 'interfaces/strategy';
import { parseParameterNumber } from 'utils/parseParameter';
import { RolloutSlider } from 'component/feature/StrategyTypes/RolloutSlider/RolloutSlider';

const SliderArea = styled('div')(({ theme }) => ({
    padding: theme.spacing(4, 3, 3),
}));

type FlexibleStrategyProps = {
    parameters: StrategyFormParameters;
    updateParameter: (field: string, value: string) => void;
};

export const FlexibleStrategy = ({
    parameters,
    updateParameter,
}: FlexibleStrategyProps) => {
    const rollout =
        parameters.rollout !== undefined
            ? parseParameterNumber(parameters.rollout)
            : 100;

    return (
        <SliderArea>
            <RolloutSlider
                name='Rollout'
                value={rollout}
                step={5}
                onChange={(_, value) =>
                    updateParameter('rollout', value.toString())
                }
            />
        </SliderArea>
    );
};
