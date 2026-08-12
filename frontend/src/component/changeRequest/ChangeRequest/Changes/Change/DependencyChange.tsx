import type { FC, ReactNode } from 'react';
import type {
    IChangeRequestAddDependency,
    IChangeRequestDeleteDependency,
} from 'component/changeRequest/changeRequest.types';
import { QuietLink } from 'component/common/QuietLink';
import {
    Added,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles';

export const DependencyChange: FC<{
    actions?: ReactNode;
    change: IChangeRequestAddDependency | IChangeRequestDeleteDependency;
    projectId: string;
    onNavigate?: () => void;
}> = ({ actions, change, projectId, onNavigate }) => {
    if (change.action === 'addDependency') {
        return (
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Added>Adding dependency</Added>
                    <QuietLink
                        to={`/projects/${projectId}/features/${change.payload.feature}`}
                        onClick={onNavigate}
                    >
                        {change.payload.feature}
                    </QuietLink>
                    {!change.payload.enabled ? ' (disabled)' : null}
                    {change.payload.variants?.length
                        ? `(${change.payload.variants?.join(', ')})`
                        : null}
                    {actions}
                </ChangeItemInfo>
            </ChangeItemWrapper>
        );
    }

    if (change.action === 'deleteDependency') {
        return (
            <ChangeItemWrapper>
                <ChangeItemInfo>
                    <Deleted>Deleting dependencies</Deleted>
                    {actions}
                </ChangeItemInfo>
            </ChangeItemWrapper>
        );
    }
};
