import { Button, Divider, Menu, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IFeatureEnvironmentWithCrEnabled } from 'interfaces/featureToggle';
import { useState } from 'react';
import { PermissionCheckboxMenuItem } from './PermissionCheckboxMenuItem';

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& > div > ul': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '& > li': {
            padding: theme.spacing(0, 1),
        },
    },
}));

const StyledActions = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

interface IPushVariantsButtonProps {
    current: string;
    environments: IFeatureEnvironmentWithCrEnabled[];
    permission: string;
    projectId: string;
    onSubmit: (selected: IFeatureEnvironmentWithCrEnabled[]) => void;
}

export const PushVariantsButton = ({
    current,
    environments,
    permission,
    projectId,
    onSubmit,
}: IPushVariantsButtonProps) => {
    const [pushToAnchorEl, setPushToAnchorEl] = useState<null | HTMLElement>(
        null
    );
    const pushToOpen = Boolean(pushToAnchorEl);

    const [selectedEnvironments, setSelectedEnvironments] = useState<
        IFeatureEnvironmentWithCrEnabled[]
    >([]);

    const addSelectedEnvironment = (
        environment: IFeatureEnvironmentWithCrEnabled
    ) => {
        setSelectedEnvironments(prevSelectedEnvironments => [
            ...prevSelectedEnvironments,
            environment,
        ]);
    };

    const removeSelectedEnvironment = (
        environment: IFeatureEnvironmentWithCrEnabled
    ) => {
        setSelectedEnvironments(prevSelectedEnvironments =>
            prevSelectedEnvironments.filter(
                ({ name }) => name !== environment.name
            )
        );
    };

    const toggleSelectedEnvironment = (
        environment: IFeatureEnvironmentWithCrEnabled
    ) => {
        if (selectedEnvironments.includes(environment)) {
            removeSelectedEnvironment(environment);
        } else {
            addSelectedEnvironment(environment);
        }
    };

    const cleanupState = () => {
        setSelectedEnvironments([]);
        setPushToAnchorEl(null);
    };

    const variants =
        environments.find(environment => environment.name === current)
            ?.variants ?? [];

    return (
        <ConditionallyRender
            condition={variants.length > 0 && environments.length > 1}
            show={
                <>
                    <Button
                        onClick={e => {
                            setPushToAnchorEl(e.currentTarget);
                        }}
                        id={`push-to-menu-${current}`}
                        aria-controls={pushToOpen ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={pushToOpen ? 'true' : undefined}
                        variant="outlined"
                    >
                        Push to environment
                    </Button>

                    <StyledMenu
                        anchorEl={pushToAnchorEl}
                        open={pushToOpen}
                        onClose={() => setPushToAnchorEl(null)}
                        MenuListProps={{
                            'aria-labelledby': `push-to-menu-${current}`,
                        }}
                    >
                        {environments
                            .filter(environment => environment.name !== current)
                            .map(otherEnvironment => (
                                <PermissionCheckboxMenuItem
                                    projectId={projectId}
                                    permission={permission}
                                    environment={otherEnvironment.name}
                                    key={otherEnvironment.name}
                                    checked={selectedEnvironments.includes(
                                        otherEnvironment
                                    )}
                                    onClick={() =>
                                        toggleSelectedEnvironment(
                                            otherEnvironment
                                        )
                                    }
                                />
                            ))}
                        <StyledActions>
                            <Divider />
                            <StyledButton
                                variant="outlined"
                                onClick={() => {
                                    onSubmit(selectedEnvironments);
                                    cleanupState();
                                }}
                                disabled={selectedEnvironments.length === 0}
                            >
                                Push to selected ({selectedEnvironments.length})
                            </StyledButton>
                        </StyledActions>
                    </StyledMenu>
                </>
            }
        />
    );
};
