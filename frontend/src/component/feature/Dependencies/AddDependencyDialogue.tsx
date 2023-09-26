import React, { useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';

interface IAddDependencyDialogueProps {
    featureId: string;
    showDependencyDialogue: boolean;
    onClose: () => void;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

export const AddDependencyDialogue = ({
    featureId,
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [parent, setParent] = useState('');
    const { addDependency, removeDependencies } = useDependentFeaturesApi();

    return (
        <Dialogue
            open={showDependencyDialogue}
            title="Add parent feature dependency"
            onClose={onClose}
            onClick={async () => {
                if (parent === '') {
                    await removeDependencies(featureId);
                } else {
                    await addDependency(featureId, { feature: parent });
                }
                onClose();
            }}
            primaryButtonText={'Add'}
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
                    options={[
                        { key: 'colors', label: 'colors' },
                        { key: 'parent', label: 'parent' },
                        { key: 'empty', label: '' },
                    ]}
                    value={parent}
                    onChange={setParent}
                />
            </Box>
        </Dialogue>
    );
};
