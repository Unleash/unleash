import { IFeatureStrategyParameters } from 'interfaces/strategy';
import StrategyInputList from '../StrategyInputList/StrategyInputList';
import { parseParameterStrings } from 'utils/parseParameter';

interface IUserWithIdStrategyProps {
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
}

const UserWithIdStrategy = ({
    editable,
    parameters,
    updateParameter,
}: IUserWithIdStrategyProps) => {
    return (
        <div>
            <StrategyInputList
                name="userIds"
                list={parseParameterStrings(parameters.userIds)}
                disabled={!editable}
                setConfig={updateParameter}
            />
        </div>
    );
};

export default UserWithIdStrategy;
