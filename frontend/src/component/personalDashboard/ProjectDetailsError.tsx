import { styled } from '@mui/material';
import type { PersonalDashboardSchemaAdminsItem } from 'openapi';
import type { FC } from 'react';
import { YourAdmins } from './YourAdmins';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const ActionBox = styled('div')(({ theme }) => ({
    flexBasis: '50%',
    padding: theme.spacing(4, 2),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

export const DataError: FC<{ project: string }> = ({ project }) => {
    return (
        <ActionBox data-loading>
            <TitleContainer>
                Couldn't fetch data for project "{project}".
            </TitleContainer>

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
        <ActionBox>
            <TitleContainer>
                Consider contacting one of your Unleash admins for help.
            </TitleContainer>
            <YourAdmins admins={admins} />
        </ActionBox>
    );
};
