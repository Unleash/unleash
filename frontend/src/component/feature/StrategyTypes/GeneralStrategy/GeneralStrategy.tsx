import React from 'react';
import { IStrategy, IFeatureStrategyParameters } from 'interfaces/strategy';
import { styled } from '@mui/system';
import { StrategyParameter } from 'component/feature/StrategyTypes/StrategyParameter/StrategyParameter';
import { IFormErrors } from 'hooks/useFormErrors';

interface IGeneralStrategyProps {
    parameters: IFeatureStrategyParameters;
    strategyDefinition: IStrategy;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
    errors: IFormErrors;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
}));

const GeneralStrategy = ({
    parameters,
    strategyDefinition,
    updateParameter,
    editable,
    errors,
}: IGeneralStrategyProps) => {
    if (!strategyDefinition || strategyDefinition.parameters.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            {strategyDefinition.parameters.map((definition, index) => (
                <div key={index}>
                    <StrategyParameter
                        definition={definition}
                        parameters={parameters}
                        updateParameter={updateParameter}
                        editable={editable}
                        errors={errors}
                    />
                </div>
            ))}
        </StyledContainer>
    );
};

export default GeneralStrategy;
