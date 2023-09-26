import React, { useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { useParentOptions } from 'hooks/api/getters/useParentOptions/useParentOptions';

interface IAddDependencyDialogueProps {
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

export const AddDependencyDialogue = ({
    featureId,
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [parent, setParent] = useState('');
    const { addDependency, removeDependencies } = useDependentFeaturesApi();
    const { parentOptions } = useParentOptions(featureId);
    const options = parentOptions
        ? [
              REMOVE_DEPENDENCY_OPTION,
              ...parentOptions.map(parent => ({ key: parent, label: parent })),
          ]
        : [REMOVE_DEPENDENCY_OPTION];

    return (
        <Dialogue
            open={showDependencyDialogue}
            title="Add parent feature dependency"
            onClose={onClose}
            onClick={async () => {
                if (parent === REMOVE_DEPENDENCY_OPTION.key) {
                    await removeDependencies(featureId);
                } else {
                    await addDependency(featureId, { feature: parent });
                }
                onClose();
            }}
            primaryButtonText="Add"
            secondaryButtonText="Cancel"
        >
            <Box>
                You feature will be evaluated only when the selected parent
                feature is enabled in the same environment.
                <br />
                <br />
                <Typography>What feature do you want to depend on?</Typography>
                <StyledSelect
                    fullWidth
                    options={options}
                    value={parent}
                    onChange={setParent}
                />
            </Box>
        </Dialogue>
    );
};
