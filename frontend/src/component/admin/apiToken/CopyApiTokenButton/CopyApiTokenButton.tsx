import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useToast from 'hooks/useToast';
import copy from 'copy-to-clipboard';
import { FileCopy } from '@mui/icons-material';
import {
    READ_API_TOKEN,
    READ_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useContext, useMemo } from 'react';
import AccessContext from 'contexts/AccessContext';

interface ICopyApiTokenButtonProps {
    token: IApiToken;
    project?: string;
}

export const CopyApiTokenButton = ({
    token,
    project,
}: ICopyApiTokenButtonProps) => {
    const { hasAccess, isAdmin } = useContext(AccessContext);
    const { setToastData } = useToast();

    const permission = Boolean(project)
        ? READ_PROJECT_API_TOKEN
        : READ_API_TOKEN;

    const canCopy = useMemo(() => {
        if (isAdmin) {
            return true;
        }
        if (token && token.projects && project && permission) {
            const { projects } = token;
            for (const tokenProject of projects) {
                if (!hasAccess(permission, tokenProject)) {
                    return false;
                }
            }
            return true;
        }
    }, [hasAccess, token, project, permission]);

    const copyToken = (value: string) => {
        if (copy(value)) {
            setToastData({
                type: 'success',
                title: `Token copied to clipboard`,
            });
        }
    };

    return (
        <PermissionIconButton
            permission={permission}
            projectId={project}
            tooltipProps={{ title: 'Copy token', arrow: true }}
            onClick={() => copyToken(token.secret)}
            size="large"
            disabled={!canCopy}
        >
            <FileCopy />
        </PermissionIconButton>
    );
};
