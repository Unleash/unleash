import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useToast from 'hooks/useToast';
import copy from 'copy-to-clipboard';
import { FileCopy } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';

interface ICopyApiTokenButtonProps {
    token: IApiToken;
    permission: string;
    project?: string;
    track?: () => void;
}

export const CopyApiTokenButton = ({
    token,
    project,
    permission,
    track,
}: ICopyApiTokenButtonProps) => {
    const { setToastData } = useToast();

    const copyToken = (value: string) => {
        if (copy(value)) {
            setToastData({
                type: 'success',
                title: `Token copied to clipboard`,
            });

            if (track && typeof track === 'function') {
                track();
            }
        }
    };

    return (
        <PermissionIconButton
            permission={permission}
            projectId={project}
            tooltipProps={{ title: 'Copy token', arrow: true }}
            onClick={() => copyToken(token.secret)}
            size="large"
        >
            <FileCopy />
        </PermissionIconButton>
    );
};
