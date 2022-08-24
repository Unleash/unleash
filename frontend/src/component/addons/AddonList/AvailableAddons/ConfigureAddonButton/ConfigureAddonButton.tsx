import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';

interface IConfigureAddonButtonProps {
    name: string;
}

export const ConfigureAddonButton = ({ name }: IConfigureAddonButtonProps) => {
    const navigate = useNavigate();

    return (
        <PermissionButton
            permission={CREATE_ADDON}
            variant="outlined"
            onClick={() => navigate(`/addons/create/${name}`)}
        >
            Configure
        </PermissionButton>
    );
};
