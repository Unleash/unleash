import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import useToast from 'hooks/useToast';
import { IGroup, IGroupUser } from 'interfaces/group';
import { FC } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IRemoveGroupUserProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user?: IGroupUser;
    group: IGroup;
}

export const RemoveGroupUser: FC<IRemoveGroupUserProps> = ({
    open,
    setOpen,
    user,
    group,
}) => {
    const { refetchGroup } = useGroup(group.id);
    const { updateGroup } = useGroupApi();
    const { setToastData, setToastApiError } = useToast();

    const onRemoveClick = async () => {
        try {
            const groupPayload = {
                ...group,
                users: group.users
                    .filter(({ id }) => id !== user?.id)
                    .map(({ id, role }) => ({
                        user: { id },
                        role,
                    })),
            };
            await updateGroup(group.id, groupPayload);
            refetchGroup();
            setOpen(false);
            setToastData({
                title: 'User removed from group successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Dialogue
            open={open && Boolean(user)}
            primaryButtonText="Remove"
            secondaryButtonText="Cancel"
            onClick={onRemoveClick}
            onClose={() => {
                setOpen(false);
            }}
            title="Remove user from group"
        >
            <Typography>
                Are you sure you wish to remove{' '}
                <strong>{user?.name || user?.username || user?.email}</strong>{' '}
                from <strong>{group.name}</strong>? Removing the user from this
                group may also remove their access from projects this group is
                assigned to.
            </Typography>
        </Dialogue>
    );
};
