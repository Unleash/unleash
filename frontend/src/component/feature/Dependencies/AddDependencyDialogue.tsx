import React, { useState } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';

interface IAddDependencyDialogueProps {
    showDependencyDialogue: boolean;
    onClose: () => void;
}

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

export const AddDependencyDialogue = ({
    showDependencyDialogue,
    onClose,
}: IAddDependencyDialogueProps) => {
    const [dependency, setDependency] = useState('');

    return (
        <Dialogue
            open={showDependencyDialogue}
            title="Add parent feature dependency"
            onClose={onClose}
            onClick={() => {}}
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
                        { key: 'a', label: 'featureA' },
                        { key: 'empty', label: '' },
                    ]}
                    value={dependency}
                    onChange={setDependency}
                />
            </Box>
        </Dialogue>
    );
};
