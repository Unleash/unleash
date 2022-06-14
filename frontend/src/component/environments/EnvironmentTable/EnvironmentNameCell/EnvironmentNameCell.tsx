import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IEnvironment } from 'interfaces/environments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StatusBadge } from 'component/common/StatusBadge/StatusBadge';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface IEnvironmentNameCellProps {
    environment: IEnvironment;
}

export const EnvironmentNameCell = ({
    environment,
}: IEnvironmentNameCellProps) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <TextCell>
            <Highlighter search={searchQuery}>{environment.name}</Highlighter>
            <ConditionallyRender
                condition={!environment.enabled}
                show={<StatusBadge severity="warning">Disabled</StatusBadge>}
            />
            <ConditionallyRender
                condition={environment.protected}
                show={<StatusBadge severity="success">Predefined</StatusBadge>}
            />
        </TextCell>
    );
};
