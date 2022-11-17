import { ListItemText, Menu, MenuItem } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { useState } from 'react';

interface IEnvironmentVariantsCopyFromProps {
    environment: IFeatureEnvironment;
    permission: string;
    projectId: string;
    onCopyVariantsFrom: (
        fromEnvironment: IFeatureEnvironment,
        toEnvironment: IFeatureEnvironment
    ) => void;
    otherEnvsWithVariants: IFeatureEnvironment[];
}

export const EnvironmentVariantsCopyFrom = ({
    environment,
    permission,
    projectId,
    onCopyVariantsFrom,
    otherEnvsWithVariants,
}: IEnvironmentVariantsCopyFromProps) => {
    const [copyFromAnchorEl, setCopyFromAnchorEl] =
        useState<null | HTMLElement>(null);
    const copyFromOpen = Boolean(copyFromAnchorEl);

    return (
        <ConditionallyRender
            condition={otherEnvsWithVariants.length > 0}
            show={
                <>
                    <PermissionButton
                        onClick={e => {
                            setCopyFromAnchorEl(e.currentTarget);
                        }}
                        id={`copy-from-menu-${environment.name}`}
                        aria-controls={copyFromOpen ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={copyFromOpen ? 'true' : undefined}
                        variant="outlined"
                        permission={permission}
                        projectId={projectId}
                    >
                        Copy variants from
                    </PermissionButton>
                    <Menu
                        anchorEl={copyFromAnchorEl}
                        open={copyFromOpen}
                        onClose={() => setCopyFromAnchorEl(null)}
                        MenuListProps={{
                            'aria-labelledby': `copy-from-menu-${environment.name}`,
                        }}
                    >
                        {otherEnvsWithVariants.map(otherEnvironment => (
                            <MenuItem
                                key={otherEnvironment.name}
                                onClick={() =>
                                    onCopyVariantsFrom(
                                        otherEnvironment,
                                        environment
                                    )
                                }
                            >
                                <ListItemText>
                                    {`Copy from ${otherEnvironment.name}`}
                                </ListItemText>
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            }
        />
    );
};
