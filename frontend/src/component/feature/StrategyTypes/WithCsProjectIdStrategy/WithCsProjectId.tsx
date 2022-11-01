import { IFeatureStrategyParameters } from 'interfaces/strategy';
import StrategyInputList from '../StrategyInputList/StrategyInputList';
import { parseParameterStrings } from 'utils/parseParameter';
import { IFormErrors } from 'hooks/useFormErrors';

interface IWithCsProjectIdStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
    errors: IFormErrors;
}

const WithCsProjectIdStrategy = ({
    editable,
    parameters,
    updateParameter,
    errors,
}: IWithCsProjectIdStrategyProps) => {
    return (
        <div>
            <StrategyInputList
                name="csProjectIds"
                list={parseParameterStrings(parameters.csProjectIds)}
                disabled={!editable}
                setConfig={updateParameter}
                errors={errors}
            />
        </div>
    );
};

export default WithCsProjectIdStrategy;
