import { ReactNode, useMemo, useState, VFC } from 'react';
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
import { ExpandMore } from '@mui/icons-material';
import { IPermission } from 'interfaces/project';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ICheckedPermission } from 'component/admin/projectRoles/hooks/useProjectRoleForm';

interface IEnvironmentPermissionAccordionProps {
    permissions: IPermission[];
    checkedPermissions: ICheckedPermission;
    title: string;
    Icon: ReactNode;
    isInitiallyExpanded?: boolean;
    context: 'project' | 'environment';
    onPermissionChange: (permission: IPermission) => void;
    onCheckAll: () => void;
    getRoleKey: (permission: { id: number; environment?: string }) => string;
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

const getPermissionGroupName = (
    permission: IPermission
): [groupName: string, order: number] => {
    const { name } = permission;

    if (name.endsWith('_PROJECT') || name === 'MOVE_FEATURE_TOGGLE') {
        return ['Project', 0];
    }
    if (name.endsWith('_FEATURE') || name === 'UPDATE_FEATURE_ENVIRONMENT') {
        return ['Feature toggles', 1];
    }
    if (name.endsWith('_VARIANTS')) {
        return ['Variants', 2];
    }
    if (name.endsWith('_STRATEGY')) {
        return ['Strategies', 3];
    }
    if (name.endsWith('_CHANGE_REQUEST')) {
        return ['Change requests', 4];
    }

    return ['Other', 5];
};

export const PermissionAccordion: VFC<IEnvironmentPermissionAccordionProps> = ({
    title,
    permissions,
    checkedPermissions,
    Icon,
    isInitiallyExpanded = false,
    context,
    onPermissionChange,
    onCheckAll,
    getRoleKey,
}) => {
    const [expanded, setExpanded] = useState(isInitiallyExpanded);
    const permissionMap = useMemo(
        () =>
            permissions?.reduce(
                (acc: Record<string, boolean>, curr: IPermission) => {
                    acc[getRoleKey(curr)] = true;
                    return acc;
                },
                {}
            ) || {},
        [permissions]
    );
    const permissionCount = useMemo(
        () =>
            Object.keys(checkedPermissions).filter(key => permissionMap[key])
                .length || 0,
        [checkedPermissions, permissionMap]
    );

    const isAllChecked = useMemo(
        () => permissionCount === permissions?.length,
        [permissionCount, permissions]
    );

    const permissionGroups = useMemo(
        () =>
            permissions
                ?.reduce((prev, next) => {
                    const [groupName, order] = getPermissionGroupName(next);
                    const id = prev.findIndex(el => el.groupName === groupName);
                    if (id === -1) {
                        prev.push({
                            groupName,
                            order,
                            groupPermissions: [next],
                        });
                    } else {
                        prev[id].groupPermissions.push(next);
                    }
                    return prev;
                }, [] as Array<{ groupName: string; order: number; groupPermissions: IPermission[] }>)
                .sort((a, b) => a.order - b.order),
        [permissions]
    );

    return (
        <Box
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
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
                }}
            >
                <AccordionSummary
                    expandIcon={
                        <IconButton>
                            <ExpandMore titleAccess="Toggle" />
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
                            maxWidth="120"
                            maxLength={25}
                        />{' '}
                        <Typography variant="body2" color="text.secondary">
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
                        variant="text"
                        size="small"
                        onClick={onCheckAll}
                        sx={{
                            fontWeight: theme =>
                                theme.typography.fontWeightRegular,
                        }}
                    >
                        {isAllChecked ? 'Unselect ' : 'Select '}
                        all {context} permissions
                    </Button>
                    <Box>
                        {permissionGroups.map(
                            ({ groupName, groupPermissions }) => (
                                <Box key={groupName} sx={{ mt: 1 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 0.5 }}
                                    >
                                        {groupName}
                                    </Typography>
                                    {groupPermissions.map(permission => (
                                        <FormControlLabel
                                            sx={{
                                                minWidth: {
                                                    sm: '300px',
                                                    xs: 'auto',
                                                },
                                            }}
                                            key={getRoleKey(permission)}
                                            control={
                                                <Checkbox
                                                    checked={
                                                        checkedPermissions[
                                                            getRoleKey(
                                                                permission
                                                            )
                                                        ]
                                                            ? true
                                                            : false
                                                    }
                                                    onChange={() =>
                                                        onPermissionChange(
                                                            permission
                                                        )
                                                    }
                                                    color="primary"
                                                />
                                            }
                                            label={permission.displayName}
                                        />
                                    ))}
                                </Box>
                            )
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
