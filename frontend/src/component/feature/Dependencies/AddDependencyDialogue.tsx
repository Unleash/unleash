import React, { FC, useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { useParentOptions } from 'hooks/api/getters/useParentOptions/useParentOptions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IAddDependencyDialogueProps {
    project: string;
    featureId: string;
    showDependencyDialogue: boolean;
    onClose: () => void;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

const REMOVE_DEPENDENCY_OPTION = {
    key: 'none (remove dependency)',
    label: 'none (remove dependency)',
};

// Project can have 100s of parents. We want to read them only when the modal for dependencies opens.
const LazyOptions: FC<{
    project: string;
    featureId: string;
    parent: string;
    onSelect: (parent: string) => void;
}> = ({ project, featureId, parent, onSelect }) => {
    const { parentOptions, loading } = useParentOptions(project, featureId);

    const options = parentOptions
        ? [
              REMOVE_DEPENDENCY_OPTION,
              ...parentOptions.map((parent) => ({
                  key: parent,
                  label: parent,
              })),
          ]
        : [REMOVE_DEPENDENCY_OPTION];
    return (
        <StyledSelect
            fullWidth
            options={options}
            value={parent}
            onChange={onSelect}
        />
    );
};

export const AddDependencyDialogue = ({
    project,
    featureId,
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [parent, setParent] = useState(REMOVE_DEPENDENCY_OPTION.key);
    const { addDependency, removeDependencies } =
        useDependentFeaturesApi(project);

    const { refetchFeature } = useFeature(project, featureId);

    return (
        <Dialogue
            open={showDependencyDialogue}
            title='Add parent feature dependency'
            onClose={onClose}
            onClick={async () => {
                if (parent === REMOVE_DEPENDENCY_OPTION.key) {
                    await removeDependencies(featureId);
                } else {
                    await addDependency(featureId, { feature: parent });
                }
                await refetchFeature();
                onClose();
            }}
            primaryButtonText={
                parent === REMOVE_DEPENDENCY_OPTION.key ? 'Remove' : 'Add'
            }
            secondaryButtonText='Cancel'
        >
            <Box>
                Your feature will be evaluated only when the selected parent
                feature is enabled in the same environment.
                <br />
                <br />
                <Typography>What feature do you want to depend on?</Typography>
                <ConditionallyRender
                    condition={showDependencyDialogue}
                    show={
                        <LazyOptions
                            project={project}
                            featureId={featureId}
                            parent={parent}
                            onSelect={setParent}
                        />
                    }
                />
            </Box>
        </Dialogue>
    );
};
