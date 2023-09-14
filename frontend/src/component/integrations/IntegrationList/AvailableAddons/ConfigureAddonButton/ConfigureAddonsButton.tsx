import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import type { AddonTypeSchema } from 'openapi';
import { useNavigate } from 'react-router-dom';

interface IConfigureAddonsButtonProps {
    provider: AddonTypeSchema;
}

/**
 * @deprecated Remove when integrationsRework flag is removed
 */
export const ConfigureAddonsButton = ({
    provider,
}: IConfigureAddonsButtonProps) => {
    const navigate = useNavigate();

    return (
        <PermissionButton
            permission={CREATE_ADDON}
            variant="outlined"
            onClick={() => {
                navigate(`/addons/create/${provider.name}`);
            }}
        >
            Configure
        </PermissionButton>
    );
};
