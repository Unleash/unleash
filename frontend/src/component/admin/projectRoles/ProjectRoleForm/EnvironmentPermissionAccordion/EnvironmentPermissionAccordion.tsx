import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import {
    IPermission,
    IProjectEnvironmentPermissions,
} from 'interfaces/project';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ICheckedPermission } from 'component/admin/projectRoles/hooks/useProjectRoleForm';
import { useStyles } from './EnvironmentPermissionAccordion.styles';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';

type PermissionMap = { [key: string]: boolean };

interface IEnvironmentPermissionAccordionProps {
    environment: IProjectEnvironmentPermissions;
    handlePermissionChange: (permission: IPermission, type: string) => void;
    checkAllEnvironmentPermissions: (envName: string) => void;
    checkedPermissions: ICheckedPermission;
    getRoleKey: (permission: { id: number; environment?: string }) => string;
}

const EnvironmentPermissionAccordion = ({
    environment,
    handlePermissionChange,
    checkAllEnvironmentPermissions,
    checkedPermissions,
    getRoleKey,
}: IEnvironmentPermissionAccordionProps) => {
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
    const { classes: styles } = useStyles();
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
                    className={styles.accordionSummary}
                    expandIcon={
                        <ExpandMore
                            className={styles.icon}
                            titleAccess="Toggle"
                        />
                    }
                >
                    <div className={styles.accordionHeader}>
                        <EnvironmentIcon enabled={false} />
                        <StringTruncator
                            text={environment.name}
                            className={styles.header}
                            maxWidth="120"
                            maxLength={25}
                        />
                        &nbsp;
                        <p className={styles.header}>
                            ({permissionCount} /{' '}
                            {environment?.permissions?.length} permissions)
                        </p>
                    </div>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionBody}>
                    {environment?.permissions?.map(
                        (permission: IPermission) => {
                            return (
                                <FormControlLabel
                                    classes={{ root: styles.label }}
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

                    <FormControlLabel
                        key={`check-all-environment-${environment?.name}`}
                        classes={{ root: styles.label }}
                        control={
                            <Checkbox
                                checked={
                                    checkedPermissions[
                                        `check-all-environment-${environment?.name}`
                                    ]
                                        ? true
                                        : false
                                }
                                onChange={() =>
                                    checkAllEnvironmentPermissions(
                                        environment?.name
                                    )
                                }
                                color="primary"
                            />
                        }
                        label={
                            <>
                                <strong>Select all</strong> permissions for this
                                env
                            </>
                        }
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default EnvironmentPermissionAccordion;
