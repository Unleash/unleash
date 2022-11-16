import { useMemo, VFC } from 'react';
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
import {
    IPermission,
    IProjectEnvironmentPermissions,
} from 'interfaces/project';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ICheckedPermission } from 'component/admin/projectRoles/hooks/useProjectRoleForm';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';

type PermissionMap = { [key: string]: boolean };

interface IEnvironmentPermissionAccordionProps {
    environment: IProjectEnvironmentPermissions;
    handlePermissionChange: (permission: IPermission, type: string) => void;
    checkAllEnvironmentPermissions: (envName: string) => void;
    checkedPermissions: ICheckedPermission;
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

const EnvironmentPermissionAccordion: VFC<
    IEnvironmentPermissionAccordionProps
> = ({
    environment,
    handlePermissionChange,
    checkAllEnvironmentPermissions,
    checkedPermissions,
    getRoleKey,
}) => {
    const permissionMap = useMemo(
        () =>
            environment?.permissions?.reduce(
                (acc: PermissionMap, curr: IPermission) => {
                    acc[getRoleKey(curr)] = true;
                    return acc;
                },
                {}
            ) || {},
        [environment?.permissions]
    );
    const permissionCount = useMemo(
        () =>
            Object.keys(checkedPermissions).filter(key => permissionMap[key])
                .length || 0,
        [checkedPermissions, permissionMap]
    );

    return (
        <Box
            sx={{
                px: 2,
                py: 1,
                mb: 1,
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            }}
        >
            <Accordion style={{ boxShadow: 'none' }}>
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
                        <EnvironmentIcon enabled={false} />
                        <StyledTitle
                            text={environment.name}
                            maxWidth="120"
                            maxLength={25}
                        />{' '}
                        <Typography variant="body2" color="text.secondary">
                            ({permissionCount} /{' '}
                            {environment?.permissions?.length} permissions)
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
                        onClick={() =>
                            checkAllEnvironmentPermissions(environment?.name)
                        }
                        sx={{
                            fontWeight: theme =>
                                theme.typography.fontWeightRegular,
                        }}
                    >
                        {checkedPermissions[
                            `check-all-environment-${environment?.name}`
                        ]
                            ? 'Unselect all '
                            : 'Select all '}
                        environment permissions
                    </Button>
                    <Box>
                        {environment?.permissions?.map(
                            (permission: IPermission) => {
                                return (
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
                                                        getRoleKey(permission)
                                                    ]
                                                        ? true
                                                        : false
                                                }
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        permission,
                                                        environment.name
                                                    )
                                                }
                                                color="primary"
                                            />
                                        }
                                        label={permission.displayName}
                                    />
                                );
                            }
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default EnvironmentPermissionAccordion;
