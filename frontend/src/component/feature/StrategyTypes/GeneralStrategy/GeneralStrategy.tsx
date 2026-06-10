import type {
    IStrategy,
    IFeatureStrategyParameters,
} from 'interfaces/strategy';
import { styled } from '@mui/system';
import { StrategyParameter } from 'component/feature/StrategyTypes/StrategyParameter/StrategyParameter';
import type { IFormErrors } from 'hooks/useFormErrors';

interface IGeneralStrategyProps {
    parameters: IFeatureStrategyParameters;
    strategyDefinition: IStrategy;
    updateParameter: (field: string, value: string) => void;
    errors: IFormErrors;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
    // Gap owns the spacing; drop members' own bottom margins (FormField's).
    '&& > *': {
        marginBottom: 0,
    },
}));

const GeneralStrategy = ({
    parameters,
    strategyDefinition,
    updateParameter,
    errors,
}: IGeneralStrategyProps) => {
    if (!strategyDefinition || strategyDefinition.parameters.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            {strategyDefinition.parameters.map((definition, index) => (
                <StrategyParameter
                    key={index}
                    definition={definition}
                    parameters={parameters}
                    updateParameter={updateParameter}
                    errors={errors}
                />
            ))}
        </StyledContainer>
    );
};

export default GeneralStrategy;
