import { ActionBox } from './ActionBox';
import { YourAdmins } from './YourAdmins';
import { NeutralCircleContainer } from './SharedComponents';
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
