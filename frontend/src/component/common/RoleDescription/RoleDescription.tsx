import { SxProps, Theme, styled } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ROOT_PERMISSION_CATEGORIES } from '@server/types/permissions';
import { useRole } from 'hooks/api/getters/useRole/useRole';

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

    const { name, description, permissions } = role;

    const categorizedPermissions = [...new Set(permissions)].map(permission => {
        const category = ROOT_PERMISSION_CATEGORIES.find(category =>
            category.permissions.includes(permission.name)
        );

        return {
            category: category ? category.label : 'Other',
            permission,
        };
    });

    const categories = new Set(
        categorizedPermissions.map(({ category }) => category).sort()
    );

    return (
        <StyledDescription tooltip={tooltip} {...rest}>
            <StyledDescriptionHeader sx={{ mb: 0 }}>
                {name}
            </StyledDescriptionHeader>
            <StyledDescriptionSubHeader>
                {description}
            </StyledDescriptionSubHeader>
            <ConditionallyRender
                condition={
                    categorizedPermissions.length > 0 && role.type !== 'root'
                }
                show={() =>
                    [...categories].map(category => (
                        <StyledDescriptionBlock key={category}>
                            <StyledDescriptionHeader>
                                {category}
                            </StyledDescriptionHeader>
                            {categorizedPermissions
                                .filter(({ category: c }) => c === category)
                                .map(({ permission }) => (
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
