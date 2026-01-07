import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { DependenciesUpgradeAlert } from './DependenciesUpgradeAlert.tsx';
import type { IDependency } from '../../../interfaces/featureToggle.ts';
import { ParentVariantOptions } from './ParentVariantOptions.tsx';
import { type ParentValue, REMOVE_DEPENDENCY_OPTION } from './constants.ts';
import { FeatureStatusOptions } from './FeatureStatusOptions.tsx';
import { useManageDependency } from './useManageDependency.ts';
import { LazyParentOptions } from './LazyParentOptions.tsx';

interface IAddDependencyDialogueProps {
    project: string;
    featureId: string;
    parentDependency?: IDependency;
    showDependencyDialogue: boolean;
    onClose: () => void;
}

export const AddDependencyDialogue = ({
    project,
    featureId,
    parentDependency,
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [parent, setParent] = useState(
        parentDependency?.feature || REMOVE_DEPENDENCY_OPTION.key,
    );

    const getInitialParentValue = (): ParentValue => {
        if (!parentDependency) return { status: 'enabled' };
        if (parentDependency.variants?.length)
            return {
                status: 'enabled_with_variants',
                variants: parentDependency.variants,
            };
        if (parentDependency.enabled === false) return { status: 'disabled' };
        return { status: 'enabled' };
    };
    const [parentValue, setParentValue] = useState<ParentValue>(
        getInitialParentValue,
    );

    const resetState = () => {
        setParent(parentDependency?.feature || REMOVE_DEPENDENCY_OPTION.key);
        setParentValue(getInitialParentValue());
    };

    useEffect(() => {
        resetState();
    }, [JSON.stringify(parentDependency)]);

    const manageDependency = useManageDependency(
        project,
        featureId,
        parent,
        parentValue,
        onClose,
    );
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(project);

    const showStatus = parent !== REMOVE_DEPENDENCY_OPTION.key;
    const showVariants =
        parent !== REMOVE_DEPENDENCY_OPTION.key &&
        parentValue.status === 'enabled_with_variants';

    const selectStatus = (value: string) => {
        if (value === 'enabled' || value === 'disabled') {
            setParentValue({ status: value });
        }
        if (value === 'enabled_with_variants') {
            setParentValue({
                status: value,
                variants: [],
            });
        }
    };

    const selectVariants = (variants: string[]) => {
        setParentValue({
            status: 'enabled_with_variants',
            variants,
        });
    };

    return (
        <Dialogue
            open={showDependencyDialogue}
            title='Add parent flag dependency'
            onClose={onClose}
            onClick={manageDependency}
            primaryButtonText={
                isChangeRequestConfiguredInAnyEnv()
                    ? 'Add change to draft'
                    : parent === REMOVE_DEPENDENCY_OPTION.key
                      ? 'Remove'
                      : 'Add'
            }
            secondaryButtonText='Cancel'
        >
            <Box>
                <DependenciesUpgradeAlert />
                <Box sx={{ mt: 2, mb: 4 }}>
                    Your feature will be evaluated only when the selected parent
                    feature is{' '}
                    <b>
                        {parentValue.status === 'disabled'
                            ? 'disabled'
                            : 'enabled'}
                    </b>{' '}
                    in the same environment.
                </Box>

                <Typography>
                    What <b>feature</b> do you want to depend on?
                </Typography>
                <ConditionallyRender
                    condition={showDependencyDialogue}
                    show={
                        <LazyParentOptions
                            project={project}
                            featureId={featureId}
                            parent={parent}
                            onSelect={(status) => {
                                setParentValue({ status: 'enabled' });
                                setParent(status);
                            }}
                        />
                    }
                />

                <ConditionallyRender
                    condition={showStatus}
                    show={
                        <Box sx={{ mt: 2 }}>
                            <Typography>
                                What <b>feature status</b> do you want to depend
                                on?
                            </Typography>
                            <FeatureStatusOptions
                                parentValue={parentValue}
                                onSelect={selectStatus}
                            />
                        </Box>
                    }
                />

                <ConditionallyRender
                    condition={showVariants}
                    show={
                        parentValue.status === 'enabled_with_variants' && (
                            <Box sx={{ mt: 2 }}>
                                <Typography>
                                    What <b>variant</b> do you want to depend
                                    on?
                                </Typography>
                                <ParentVariantOptions
                                    parent={parent}
                                    project={project}
                                    selectedValues={parentValue.variants}
                                    onSelect={selectVariants}
                                />
                            </Box>
                        )
                    }
                />
            </Box>
        </Dialogue>
    );
};
