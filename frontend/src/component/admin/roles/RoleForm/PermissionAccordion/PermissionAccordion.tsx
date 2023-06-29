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
import { ICheckedPermissions, IPermission } from 'interfaces/permissions';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { getRoleKey } from 'utils/permissions';

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

export const PermissionAccordion: VFC<IEnvironmentPermissionAccordionProps> = ({
    title,
    permissions,
    checkedPermissions,
    Icon,
    isInitiallyExpanded = false,
    context,
    onPermissionChange,
    onCheckAll,
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
                        {permissions?.map((permission: IPermission) => (
                            <FormControlLabel
                                sx={{
                                    minWidth: {
                                        sm: '300px',
                                        xs: 'auto',
                                    },
                                }}
                                data-testid={getRoleKey(permission)}
                                key={getRoleKey(permission)}
                                control={
                                    <Checkbox
                                        checked={Boolean(
                                            checkedPermissions[
                                                getRoleKey(permission)
                                            ]
                                        )}
                                        onChange={() =>
                                            onPermissionChange(permission)
                                        }
                                        color="primary"
                                    />
                                }
                                label={permission.displayName}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
