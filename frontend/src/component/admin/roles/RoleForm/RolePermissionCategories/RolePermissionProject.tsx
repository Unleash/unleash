import { useMemo } from 'react';
import {
    Box,
    Checkbox,
    FormControlLabel,
    styled,
    Typography,
} from '@mui/material';
import type { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import { getRoleKey } from 'utils/permissions';
import {
    type PermissionCategory,
    PROJECT_PERMISSIONS_STRUCTURE,
} from '@server/types/permissions';

interface IEnvironmentPermissionAccordionProps {
    permissions: IPermission[];
    checkedPermissions: ICheckedPermissions;
    onPermissionChange: (permission: IPermission) => void;
}

const StyledGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    lineHeight: 1.2,
    marginBottom: theme.spacing(1),
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const ProjectRolePermissionCategory = ({
    permissions,
    checkedPermissions,
    onPermissionChange,
}: IEnvironmentPermissionAccordionProps) => {
    const allPermissions = useMemo(
        () =>
            permissions?.map((permission) => getRoleKey(permission)).sort() ||
            [],
        [permissions],
    );

    const otherPermissions = useMemo(() => {
        const allStructuredPermissions = PROJECT_PERMISSIONS_STRUCTURE.flatMap(
            (category) =>
                category.permissions.map(([permission]) => permission),
        ).sort() as string[];

        return allPermissions.filter(
            (permission) => !allStructuredPermissions.includes(permission),
        );
    }, [permissions]);

    const permissionsStructure = useMemo(
        () =>
            [
                ...PROJECT_PERMISSIONS_STRUCTURE,
                {
                    label: 'Other',
                    permissions: otherPermissions.map((p) => [p]),
                } as PermissionCategory,
            ]
                .map((category) => ({
                    label: category.label,
                    permissions: category.permissions
                        .filter(([permission]) =>
                            allPermissions.includes(permission),
                        )
                        .map(([permission, parentPermission]) => [
                            permissions.find(
                                (p) => getRoleKey(p) === permission,
                            ),
                            parentPermission,
                        ]) as [IPermission, string?][],
                }))
                .filter((category) => category.permissions.length > 0),
        [allPermissions],
    );

    return (
        <StyledGrid>
            {permissionsStructure.map((category) => (
                <div>
                    <StyledSectionTitle>{category.label}</StyledSectionTitle>
                    <div>
                        {category.permissions.map(
                            ([permission, parentPermission]) => (
                                <Box
                                    sx={(theme) => ({
                                        marginLeft: parentPermission
                                            ? theme.spacing(1.5)
                                            : 0,
                                    })}
                                >
                                    <FormControlLabel
                                        data-testid={permission}
                                        key={permission.name}
                                        control={
                                            <Checkbox
                                                checked={Boolean(
                                                    checkedPermissions[
                                                        permission.name
                                                    ] ||
                                                        (parentPermission &&
                                                            checkedPermissions[
                                                                parentPermission
                                                            ]),
                                                )}
                                                onChange={() =>
                                                    onPermissionChange(
                                                        permission,
                                                    )
                                                }
                                                color='primary'
                                                disabled={Boolean(
                                                    parentPermission &&
                                                        checkedPermissions[
                                                            parentPermission
                                                        ],
                                                )}
                                            />
                                        }
                                        label={
                                            <StyledLabel>
                                                {permission.displayName}
                                            </StyledLabel>
                                        }
                                    />
                                </Box>
                            ),
                        )}
                    </div>
                </div>
            ))}
        </StyledGrid>
    );
};
