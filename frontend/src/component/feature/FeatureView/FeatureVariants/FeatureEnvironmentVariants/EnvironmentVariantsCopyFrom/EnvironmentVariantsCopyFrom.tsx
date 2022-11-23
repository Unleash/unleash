import { ListItemText, Menu, MenuItem, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { useState } from 'react';

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& span': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

interface IEnvironmentVariantsCopyFromProps {
    environment: IFeatureEnvironment;
    permission: string;
    projectId: string;
    environmentId: string;
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
    environmentId,
    onCopyVariantsFrom,
    otherEnvsWithVariants,
}: IEnvironmentVariantsCopyFromProps) => {
    const [copyFromAnchorEl, setCopyFromAnchorEl] =
        useState<null | HTMLElement>(null);
    const copyFromOpen = Boolean(copyFromAnchorEl);

    const variants = environment.variants ?? [];

    return (
        <ConditionallyRender
            condition={
                otherEnvsWithVariants.length > 0 && variants.length === 0
            }
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
                        environmentId={environmentId}
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
                                <StyledListItemText>
                                    {`Copy from ${otherEnvironment.name}`}
                                </StyledListItemText>
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            }
        />
    );
};
