import { SxProps, Theme, styled } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
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
    shouldForwardProp: prop => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: tooltip ? theme.spacing(1) : theme.spacing(3),
    backgroundColor: tooltip
        ? theme.palette.background.paper
        : theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledDescriptionBlock = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(1),
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
            <StyledDescriptionHeader sx={{ mb: 0 }}>
                {name}
            </StyledDescriptionHeader>
            <StyledDescriptionSubHeader>
                {description}
            </StyledDescriptionSubHeader>
            <ConditionallyRender
                condition={!PREDEFINED_ROLE_TYPES.includes(role.type)}
                show={() =>
                    categories.map(({ label, permissions }) => (
                        <StyledDescriptionBlock key={label}>
                            <StyledDescriptionHeader>
                                {label}
                            </StyledDescriptionHeader>
                            {permissions.map(permission => (
                                <p key={permission.id}>
                                    {permission.displayName}
                                </p>
                            ))}
                        </StyledDescriptionBlock>
                    ))
                }
            />
        </StyledDescription>
    );
};
