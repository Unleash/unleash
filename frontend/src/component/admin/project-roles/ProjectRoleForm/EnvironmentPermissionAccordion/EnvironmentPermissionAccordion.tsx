import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    FormControlLabel,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { useEffect, useState } from 'react';
import {
    IPermission,
    IProjectEnvironmentPermissions,
} from '../../../../../interfaces/project';
import StringTruncator from '../../../../common/StringTruncator/StringTruncator';
import { ICheckedPermission } from '../../hooks/useProjectRoleForm';
import { useStyles } from './EnvironmentPermissionAccordion.styles';

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
    const [permissionMap, setPermissionMap] = useState<PermissionMap>({});
    const [permissionCount, setPermissionCount] = useState(0);
    const styles = useStyles();

    useEffect(() => {
        const permissionMap = environment?.permissions?.reduce(
            (acc: PermissionMap, curr: IPermission) => {
                acc[getRoleKey(curr)] = true;
                return acc;
            },
            {}
        );

        setPermissionMap(permissionMap);
        /* eslint-disable-next-line */
    }, [environment?.permissions?.length]);

    useEffect(() => {
        let count = 0;
        Object.keys(checkedPermissions).forEach(key => {
            if (permissionMap[key]) {
                count = count + 1;
            }
        });

        setPermissionCount(count);
        /* eslint-disable-next-line */
    }, [checkedPermissions]);

    const renderPermissions = () => {
        const envPermissions = environment?.permissions?.map(
            (permission: IPermission) => {
                return (
                    <FormControlLabel
                        classes={{ root: styles.label }}
                        key={getRoleKey(permission)}
                        control={
                            <Checkbox
                                checked={
                                    checkedPermissions[getRoleKey(permission)]
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
                        label={permission.displayName || 'Dummy permission'}
                    />
                );
            }
        );

        envPermissions.push(
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
                            checkAllEnvironmentPermissions(environment?.name)
                        }
                        color="primary"
                    />
                }
                label={'Select all permissions for this env'}
            />
        );

        return envPermissions;
    };

    return (
        <div className={styles.environmentPermissionContainer}>
            <Accordion style={{ boxShadow: 'none' }}>
                <AccordionSummary
                    className={styles.accordionSummary}
                    expandIcon={<ExpandMore className={styles.icon} />}
                >
                    <div className={styles.accordionHeader}>
                        <StringTruncator
                            text={environment.name}
                            className={styles.header}
                            maxWidth="120"
                        />
                        &nbsp;
                        <p className={styles.header}>
                            ({permissionCount} /{' '}
                            {environment?.permissions?.length} permissions)
                        </p>
                    </div>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionBody}>
                    {renderPermissions()}
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default EnvironmentPermissionAccordion;
