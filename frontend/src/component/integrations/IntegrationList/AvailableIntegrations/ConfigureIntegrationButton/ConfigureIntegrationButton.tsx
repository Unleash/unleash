import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { IAddonProvider } from 'interfaces/addons';
import { useNavigate } from 'react-router-dom';

interface IConfigureIntegrationButtonProps {
    provider: IAddonProvider;
}

export const ConfigureIntegrationButton = ({
    provider,
}: IConfigureIntegrationButtonProps) => {
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
