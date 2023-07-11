import { styled } from '@mui/material';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { IAddonProvider } from 'interfaces/addons';
import { useNavigate } from 'react-router-dom';

const StyledPermissionButton = styled(PermissionButton)(({ theme }) => ({
    width: theme.spacing(15),
}));

interface IConfigureAddonButtonProps {
    provider: IAddonProvider;
}

export const ConfigureAddonButton = ({
    provider,
}: IConfigureAddonButtonProps) => {
    const navigate = useNavigate();

    const install = Boolean(provider.configureInstall);

    return (
        <StyledPermissionButton
            permission={CREATE_ADDON}
            variant="outlined"
            onClick={() => {
                if (provider.configureInstall) {
                    window.location.href = provider.configureInstall;
                } else {
                    navigate(`/addons/create/${provider.name}`);
                }
            }}
        >
            {install ? 'Install' : 'Configure'}
        </StyledPermissionButton>
    );
};
