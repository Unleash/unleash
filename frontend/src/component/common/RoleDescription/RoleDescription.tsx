import { type SxProps, type Theme, styled } from '@mui/material';
import SupervisedUserCircle from '@mui/icons-material/SupervisedUserCircle';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import {
    PREDEFINED_ROLE_TYPES,
    PROJECT_ROLE_TYPES,
} from '@server/util/constants';
import {
    getCategorizedProjectPermissions,
    getCategorizedRootPermissions,
} from 'utils/permissions';

const StyledDescription = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: tooltip ? theme.spacing(1) : theme.spacing(3),
    backgroundColor: tooltip
        ? theme.palette.background.paper
        : theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: tooltip ? 0 : theme.shape.borderRadiusMedium,
}));

const StyledPermissionsLabel = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
}));

const StyledPermissions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledRoleHeader = styled('p')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.fontWeight.bold,
}));

const StyledSupervisedUserCircle = styled(SupervisedUserCircle)(
    ({ theme }) => ({
        fontSize: theme.fontSizes.mainHeader,
    }),
);

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.fontWeight.bold,
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(0.5),
}));

const StyledPermissionsList = styled('ul')(({ theme }) => ({
    margin: 0,
    paddingLeft: theme.spacing(2),
}));

interface IRoleDescriptionProps {
    roleId: number;
    tooltip?: boolean;
    className?: string;
    sx?: SxProps<Theme>;
}

export const RoleDescription = ({
    roleId,
    tooltip,
    ...rest
}: IRoleDescriptionProps) => {
    const { role } = useRole(roleId.toString());

    if (!role) return null;

    const { name, description, permissions, type } = role;

    const isProjectRole = PROJECT_ROLE_TYPES.includes(type);

    const categories = isProjectRole
        ? getCategorizedProjectPermissions(permissions)
        : getCategorizedRootPermissions(permissions);

    return (
        <StyledDescription tooltip={tooltip} {...rest}>
            <StyledRoleHeader>
                <StyledSupervisedUserCircle color='disabled' />
                {name}
            </StyledRoleHeader>
            <StyledDescriptionSubHeader>
                {description}
            </StyledDescriptionSubHeader>
            <ConditionallyRender
                condition={!PREDEFINED_ROLE_TYPES.includes(role.type)}
                show={() => (
                    <>
                        <StyledPermissionsLabel>
                            Role permissions:
                        </StyledPermissionsLabel>
                        <StyledPermissions>
                            {categories.map(({ label, permissions }) => (
                                <div key={label}>
                                    <StyledDescriptionHeader>
                                        {label}
                                    </StyledDescriptionHeader>
                                    <StyledPermissionsList>
                                        {permissions.map((permission) => (
                                            <li key={permission.name}>
                                                {permission.displayName}
                                            </li>
                                        ))}
                                    </StyledPermissionsList>
                                </div>
                            ))}
                        </StyledPermissions>
                    </>
                )}
            />
        </StyledDescription>
    );
};
