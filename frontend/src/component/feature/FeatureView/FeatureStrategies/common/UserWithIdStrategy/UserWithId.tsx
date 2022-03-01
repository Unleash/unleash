import { IParameter } from '../../../../../../interfaces/strategy';
import StrategyInputList from '../StrategyInputList/StrategyInputList';

interface IUserWithIdStrategyProps {
    parameters: IParameter;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
}

const UserWithIdStrategy = ({
    editable,
    parameters,
    updateParameter,
}: IUserWithIdStrategyProps) => {
    const value = parameters.userIds;

    let list: string[] = [];
    if (typeof value === 'string') {
        list = value.trim().split(',').filter(Boolean);
    }

    return (
        <div>
            <StrategyInputList
                name="userIds"
                list={list}
                disabled={!editable}
                setConfig={updateParameter}
            />
        </div>
    );
};

export default UserWithIdStrategy;
