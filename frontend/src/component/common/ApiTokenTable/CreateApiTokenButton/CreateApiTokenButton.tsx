import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
interface ICreateApiTokenButton {
    path: string;
    permission: string | string[];
    project?: string;
}

const useApiTokenLimit = (apiTokenLimit: number, apiTokenCount: number) => {
    const limitReached = apiTokenCount >= apiTokenLimit;

    return {
        limitReached,
        limitMessage: limitReached
            ? `You have reached the limit of ${apiTokenLimit} API tokens`
            : undefined,
    };
};

export const CreateApiTokenButton = ({
    path,
    permission,
    project,
}: ICreateApiTokenButton) => {
    const navigate = useNavigate();
    const { tokens, loading } = useApiTokens();
    const { uiConfig } = useUiConfig();

    const { limitReached, limitMessage } = useApiTokenLimit(
        uiConfig.resourceLimits.apiTokens,
        tokens.length,
    );

    return (
        <ResponsiveButton
            Icon={Add}
            onClick={() => navigate(path)}
            data-testid={CREATE_API_TOKEN_BUTTON}
            permission={permission}
            projectId={project}
            maxWidth='700px'
            disabled={loading || limitReached}
            tooltipProps={{
                title: limitMessage,
            }}
        >
            New API token
        </ResponsiveButton>
    );
};
