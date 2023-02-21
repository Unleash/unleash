import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledUl = styled('ul')({
    marginBottom: 0,
});

interface IRemoveApiTokenButtonProps {
    token: IApiToken;
    permission: string;
    remove: () => void;
    track?: () => void;
    project?: string;
}

export const RemoveApiTokenButton = ({
    token,
    permission,
    remove,
    track,
    project,
}: IRemoveApiTokenButtonProps) => {
    const [open, setOpen] = useState(false);
    const { setToastData, setToastApiError } = useToast();

    const onRemove = async () => {
        try {
            await remove();
            setOpen(false);

            setToastData({
                type: 'success',
                title: 'API token removed',
            });
            if (track && typeof track === 'function') {
                track();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <>
            <PermissionIconButton
                permission={permission}
                projectId={project}
                tooltipProps={{ title: 'Delete token', arrow: true }}
                onClick={() => setOpen(true)}
                size="large"
            >
                <Delete />
            </PermissionIconButton>
            <Dialogue
                open={open}
                onClick={onRemove}
                onClose={() => setOpen(false)}
                title="Confirm deletion"
            >
                <div>
                    Are you sure you want to delete the following API token?
                    <br />
                    <StyledUl>
                        <li>
                            <strong>username</strong>:{' '}
                            <code>{token.username}</code>
                        </li>
                        <li>
                            <strong>type</strong>: <code>{token.type}</code>
                        </li>
                    </StyledUl>
                </div>
            </Dialogue>
        </>
    );
};
