import Delete from '@mui/icons-material/Delete';
import { styled } from '@mui/material';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useTracking } from 'hooks/useTracking';
import { apiTokenDeletedTracking } from 'component/common/ApiTokenTable/apiTokenTracking';

const StyledUl = styled('ul')({
    marginBottom: 0,
});

interface IRemoveApiTokenButtonProps {
    token: IApiToken;
    permission: string;
    onRemove: () => Promise<void>;
    project?: string;
}

export const RemoveApiTokenButton = ({
    token,
    permission,
    onRemove,
    project,
}: IRemoveApiTokenButtonProps) => {
    const [open, setOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const { setToastData, setToastApiError } = useToast();
    const tracking = apiTokenDeletedTracking(token);
    const trackRemove = useTracking(tracking);

    const onRemoveToken = async () => {
        setRemoving(true);
        try {
            await trackRemove.mutation(onRemove);
            setOpen(false);

            setToastData({
                type: 'success',
                text: 'API token removed',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <PermissionIconButton
                permission={permission}
                projectId={project}
                tooltipProps={{ title: 'Delete token', arrow: true }}
                onClick={() => setOpen(true)}
                size='large'
            >
                <Delete />
            </PermissionIconButton>
            <Dialogue
                open={open}
                onClick={onRemoveToken}
                onClose={() => setOpen(false)}
                disabledPrimaryButton={removing}
                title='Confirm deletion'
                tracking={tracking}
            >
                <div>
                    Are you sure you want to delete the following API token?
                    <br />
                    <StyledUl>
                        <li>
                            <strong>name</strong>:{' '}
                            <code>{token.tokenName}</code>
                        </li>
                        <li>
                            <strong>type</strong>: <code>{token.type}</code>
                        </li>
                        <li>
                            <strong>environment</strong>:{' '}
                            <code>{token.environment}</code>
                        </li>
                    </StyledUl>
                </div>
            </Dialogue>
        </>
    );
};
