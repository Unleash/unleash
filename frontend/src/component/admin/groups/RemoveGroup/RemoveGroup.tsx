import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';
import useToast from 'hooks/useToast';
import { IGroup } from 'interfaces/group';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IRemoveGroupProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    group: IGroup;
}

export const RemoveGroup: FC<IRemoveGroupProps> = ({
    open,
    setOpen,
    group,
}) => {
    const { refetchGroups } = useGroups();
    const { removeGroup } = useGroupApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();

    const onRemoveClick = async () => {
        try {
            await removeGroup(group.id);
            refetchGroups();
            setOpen(false);
            navigate('/admin/groups');
            setToastData({
                title: 'Group removed successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Dialogue
            open={open}
            primaryButtonText="Delete group"
            secondaryButtonText="Cancel"
            onClick={onRemoveClick}
            onClose={() => {
                setOpen(false);
            }}
            title="Delete group?"
        >
            <Typography>
                Do you really want to delete <strong>{group.name}</strong>?
                Users who are granted access to projects only via this group
                will lose access to those projects.
            </Typography>
        </Dialogue>
    );
};
