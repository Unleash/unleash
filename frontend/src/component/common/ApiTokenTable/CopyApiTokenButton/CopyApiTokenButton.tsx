import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useToast from 'hooks/useToast';
import copy from 'copy-to-clipboard';
import FileCopy from '@mui/icons-material/FileCopy';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useTracking } from 'hooks/useTracking';
import { apiTokenCopiedTracking } from 'component/common/ApiTokenTable/apiTokenTracking';

interface ICopyApiTokenButtonProps {
    token: IApiToken;
    permission: string;
    project?: string;
}

export const CopyApiTokenButton = ({
    token,
    project,
    permission,
}: ICopyApiTokenButtonProps) => {
    const { setToastData } = useToast();
    const trackApiTokenCopied = useTracking(
        apiTokenCopiedTracking(token, 'token-list'),
    );

    const copyToken = (value: string) => {
        if (copy(value)) {
            trackApiTokenCopied('succeeded');
            setToastData({
                type: 'success',
                text: 'Token copied to clipboard',
            });
        } else {
            trackApiTokenCopied('failed', { failedOn: 'clipboard' });
        }
    };

    return (
        <PermissionIconButton
            permission={permission}
            projectId={project}
            tooltipProps={{ title: 'Copy token', arrow: true }}
            onClick={() => copyToken(token.secret)}
            size='large'
        >
            <FileCopy />
        </PermissionIconButton>
    );
};
