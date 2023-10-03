import { useContext } from 'react';
import { Alert, styled } from '@mui/material';
import { ADMIN } from '@server/types/permissions';
import AccessContext from 'contexts/AccessContext';

const StyledList = styled('ul')(({ theme }) => ({
    paddingInlineStart: theme.spacing(2),
}));

interface IPermissionGuardProps {
    permissions: string | string[];
    children: JSX.Element;
}

export const PermissionGuard = ({
    permissions,
    children,
}: IPermissionGuardProps) => {
    const { hasAccess } = useContext(AccessContext);

    const permissionsArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

    if (!permissionsArray.includes(ADMIN)) {
        permissionsArray.push(ADMIN);
    }

    if (hasAccess(permissionsArray)) {
        return children;
    }

    if (permissionsArray.length === 1) {
        return (
            <Alert severity="error">
                You need the <strong>{permissionsArray[0]}</strong> permission
                to access this section.
            </Alert>
        );
    }

    return (
        <Alert severity="error">
            You need one of the following permissions to access this section:
            <StyledList>
                {permissionsArray.sort().map(permission => (
                    <li key={permission}>
                        <strong>{permission}</strong>
                    </li>
                ))}
            </StyledList>
        </Alert>
    );
};
