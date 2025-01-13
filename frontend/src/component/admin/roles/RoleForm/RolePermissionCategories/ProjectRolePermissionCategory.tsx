import { type ReactNode, useMemo, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    styled,
    Typography,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import type { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { getRoleKey } from 'utils/permissions';
import {
    type PermissionCategory,
    PROJECT_PERMISSIONS_STRUCTURE,
} from '@server/types/permissions';

interface IEnvironmentPermissionAccordionProps {
    permissions: IPermission[];
    checkedPermissions: ICheckedPermissions;
    title: string;
    Icon: ReactNode;
    isInitiallyExpanded?: boolean;
    context: string;
    onPermissionChange: (permission: IPermission) => void;
    onCheckAll: () => void;
}

const AccordionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(500)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

const StyledTitle = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginRight: theme.spacing(1),
}));

export const ProjectRolePermissionCategory = ({
    title,
    permissions,
    checkedPermissions,
    Icon,
    isInitiallyExpanded = false,
    context,
    onPermissionChange,
    onCheckAll,
}: IEnvironmentPermissionAccordionProps) => {
    const [expanded, setExpanded] = useState(isInitiallyExpanded);
    const permissionMap = useMemo(
        () =>
            permissions?.reduce(
                (acc: Record<string, boolean>, curr: IPermission) => {
                    acc[getRoleKey(curr)] = true;
                    return acc;
                },
                {},
            ) || {},
        [permissions],
    );
    const permissionCount = useMemo(
        () =>
            Object.keys(checkedPermissions).filter((key) => permissionMap[key])
                .length || 0,
        [checkedPermissions, permissionMap],
    );

    const isAllChecked = useMemo(
        () => permissionCount === permissions?.length,
        [permissionCount, permissions],
    );

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
        <Box
            // FIXME: style
            sx={{
                my: 2,
                pb: 1,
            }}
        >
            <Accordion
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}
                sx={{
                    boxShadow: 'none',
                    px: 3,
                    py: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: (theme) =>
                        `${theme.shape.borderRadiusLarge}px`,
                }}
            >
                <AccordionSummary
                    expandIcon={
                        <IconButton>
                            <ExpandMore titleAccess='Toggle' />
                        </IconButton>
                    }
                    sx={{
                        boxShadow: 'none',
                        padding: '0',
                    }}
                >
                    <AccordionHeader>
                        {Icon}
                        <StyledTitle
                            text={title}
                            maxWidth='120'
                            maxLength={25}
                        />{' '}
                        <Typography variant='body2' color='text.secondary'>
                            ({permissionCount} / {permissions?.length}{' '}
                            permissions)
                        </Typography>
                    </AccordionHeader>
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        px: 0,
                        py: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Divider sx={{ mb: 1 }} />
                    <Button
                        variant='text'
                        size='small'
                        onClick={onCheckAll}
                        sx={{
                            fontWeight: (theme) =>
                                theme.typography.fontWeightRegular,
                        }}
                    >
                        {isAllChecked ? 'Unselect ' : 'Select '}
                        all {context} permissions
                    </Button>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {permissionsStructure.map((category) => (
                            <div style={{ width: '50%' }}>
                                <Typography fontWeight='bold' mt={2} mb={1}>
                                    {/* FIXME: style */}
                                    {category.label}
                                </Typography>
                                <div>
                                    {category.permissions.map(
                                        ([permission, parentPermission]) => (
                                            <div
                                                style={{
                                                    // FIXME: style
                                                    marginLeft: parentPermission
                                                        ? '2rem'
                                                        : 0,
                                                }}
                                            >
                                                <FormControlLabel
                                                    data-testid={permission}
                                                    key={permission.name}
                                                    control={
                                                        <Checkbox
                                                            checked={Boolean(
                                                                checkedPermissions[
                                                                    permission
                                                                        .name
                                                                ],
                                                            )}
                                                            onChange={() =>
                                                                onPermissionChange(
                                                                    permission,
                                                                )
                                                            }
                                                            color='primary'
                                                        />
                                                    }
                                                    label={
                                                        permission.displayName
                                                    }
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
