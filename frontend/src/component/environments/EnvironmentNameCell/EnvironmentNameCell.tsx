import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IEnvironment } from 'interfaces/environments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StatusBadge } from 'component/common/StatusBadge/StatusBadge';

interface IEnvironmentNameCellProps {
    environment: IEnvironment;
}

export const EnvironmentNameCell = ({
    environment,
}: IEnvironmentNameCellProps) => {
    return (
        <TextCell>
            {environment.name}
            <ConditionallyRender
                condition={!environment.enabled}
                show={<StatusBadge severity="warning">Disabled</StatusBadge>}
            />
        </TextCell>
    );
};
