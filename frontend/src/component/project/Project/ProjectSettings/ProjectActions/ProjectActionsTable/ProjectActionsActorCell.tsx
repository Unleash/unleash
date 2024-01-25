import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { IServiceAccount } from 'interfaces/service-account';

interface IProjectActionsActorCellProps {
    action: IActionSet;
    serviceAccounts: IServiceAccount[];
}

export const ProjectActionsActorCell = ({
    action,
    serviceAccounts,
}: IProjectActionsActorCellProps) => {
    const { sourceId } = action.match;
    const actor = serviceAccounts.find(({ id }) => id === sourceId);

    if (!actor) {
        return <TextCell>No service account</TextCell>;
    }

    return <TextCell>{actor.name}</TextCell>;
};
