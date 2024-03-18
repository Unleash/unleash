import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IActionSet } from 'interfaces/action';
import type { IServiceAccount } from 'interfaces/service-account';

interface IProjectActionsActorCellProps {
    action: IActionSet;
    serviceAccounts: IServiceAccount[];
}

export const ProjectActionsActorCell = ({
    action,
    serviceAccounts,
}: IProjectActionsActorCellProps) => {
    const { actorId } = action;
    const actor = serviceAccounts.find(({ id }) => id === actorId);

    if (!actor) {
        return <TextCell>No service account</TextCell>;
    }

    return (
        <LinkCell
            to='/admin/service-accounts'
            title={actor.name}
            subtitle={actor.username}
        />
    );
};
