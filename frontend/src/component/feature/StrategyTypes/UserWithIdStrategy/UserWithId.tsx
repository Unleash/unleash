import { IFeatureStrategyParameters } from 'interfaces/strategy';
import StrategyInputList from '../StrategyInputList/StrategyInputList';
import { parseParameterStrings } from 'utils/parseParameter';
import { IFormErrors } from 'hooks/useFormErrors';

interface IUserWithIdStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
    errors: IFormErrors;
}

const UserWithIdStrategy = ({
    editable,
    parameters,
    updateParameter,
    errors,
}: IUserWithIdStrategyProps) => {
    return (
        <div>
            <StrategyInputList
                name="userIds"
                list={parseParameterStrings(parameters.userIds)}
                disabled={!editable}
                setConfig={updateParameter}
                errors={errors}
            />
        </div>
    );
};

export default UserWithIdStrategy;
