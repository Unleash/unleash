import { ActionBox } from './ActionBox.tsx';
import { YourAdmins } from './YourAdmins.tsx';
import { NeutralCircleContainer } from './SharedComponents.tsx';
import type { PersonalDashboardSchemaAdminsItem } from 'openapi';
import type { FC } from 'react';

export const NoProjectsContactAdmin: FC<{
    admins: PersonalDashboardSchemaAdminsItem[];
}> = ({ admins }) => {
    return (
        <ActionBox
            title={
                <>
                    <NeutralCircleContainer>1</NeutralCircleContainer>
                    Contact Unleash admin
                </>
            }
        >
            <YourAdmins admins={admins} />
        </ActionBox>
    );
};
