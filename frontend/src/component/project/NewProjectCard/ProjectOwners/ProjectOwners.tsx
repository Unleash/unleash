import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useMemo, type FC } from 'react';

interface IProjectOwnersProps {
    owners?: {
        users: any[];
        groups: any[];
    };
}

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners }) => {
    // @ts-ignore // FIXME: groups
    const allUsers = [
        ...(owners?.users || []),
        ...(owners?.groups || []).flatMap((group) =>
            group.users.map((item: any) => item.user),
        ),
    ];
    const { uiConfig } = useUiConfig();

    const users = allUsers.length
        ? allUsers
        : [
              {
                  id: 'no-owner',
                  name: 'System',
                  imageUrl: `${uiConfig.unleashUrl}/logo-unleash.png`,
              },
          ];

    const header = useMemo(() => {
        if (users.length === 1 && !owners?.groups.length) {
            return 'Owner';
        }
        if (owners?.groups.length === 1 && !users.length) {
            return 'Owner';
        }
        return 'Owners';
    }, [owners]);

    return (
        <StyledContainer>
            <GroupCardAvatars header={header} users={users} withDescription />
        </StyledContainer>
    );
};
