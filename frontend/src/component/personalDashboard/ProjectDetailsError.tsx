import type { PersonalDashboardSchemaAdminsItem } from 'openapi';
import type { FC } from 'react';
import { YourAdmins } from './YourAdmins.tsx';
import { ActionBox } from './ActionBox.tsx';

export const DataError: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox title={`Couldn't fetch data for project "${project}".`}>
            <p>
                The API request to get data for this project returned with an
                error.
            </p>
            <p>
                This may be due to an intermittent error or it may be due to
                issues with the project's id ("{project}"). You can try
                reloading to see if that helps.
            </p>
        </ActionBox>
    );
};

export const ContactAdmins: FC<{
    admins: PersonalDashboardSchemaAdminsItem[];
}> = ({ admins }) => {
    return (
        <ActionBox title='Consider contacting one of your Unleash admins for help.'>
            <YourAdmins admins={admins} />
        </ActionBox>
    );
};
