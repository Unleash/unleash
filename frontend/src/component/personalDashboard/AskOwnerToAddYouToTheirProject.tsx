import { ActionBox } from './ActionBox.tsx';
import { NeutralCircleContainer } from './SharedComponents.tsx';
import type { PersonalDashboardSchemaProjectOwnersItem } from 'openapi';
import type { FC } from 'react';
import { AvatarGroupFromOwners } from 'component/common/AvatarGroupFromOwners/AvatarGroupFromOwners';

export const AskOwnerToAddYouToTheirProject: FC<{
    owners: PersonalDashboardSchemaProjectOwnersItem[];
}> = ({ owners }) => {
    return (
        <ActionBox
            title={
                <>
                    <NeutralCircleContainer>2</NeutralCircleContainer>
                    Ask a project owner to add you to their project
                </>
            }
        >
            {owners.length ? (
                <>
                    <p>Project owners in Unleash:</p>
                    <AvatarGroupFromOwners users={owners} avatarLimit={9} />
                </>
            ) : (
                <p>There are no project owners in Unleash to ask for access.</p>
            )}
        </ActionBox>
    );
};
