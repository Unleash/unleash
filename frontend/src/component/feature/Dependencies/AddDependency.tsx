import { Box, styled } from '@mui/material';
import { trim } from '../../common/util';
import React, { FC, useState } from 'react';
import Input from '../../common/Input/Input';
import { CREATE_FEATURE } from '../../providers/AccessProvider/permissions';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';

const StyledForm = styled('form')({});

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

interface IAddDependencyProps {
    projectId: string;
    featureId: string;
}
export const AddDependency: FC<IAddDependencyProps> = ({
    projectId,
    featureId,
}) => {
    const [parent, setParent] = useState('');
    const { addDependency } = useDependentFeaturesApi();

    return (
        <StyledForm
            onSubmit={() => {
                addDependency(featureId, { feature: parent });
            }}
        >
            <StyledInputDescription>
                What feature do you want to depend on?
            </StyledInputDescription>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <StyledInput
                    autoFocus
                    label="Dependency"
                    id="dependency-feature"
                    value={parent}
                    onChange={e => setParent(trim(e.target.value))}
                />
                <PermissionButton
                    permission={CREATE_FEATURE}
                    projectId={projectId}
                    onClick={() => {
                        addDependency(featureId, { feature: parent });
                    }}
                    variant={'outlined'}
                >
                    Add{' '}
                </PermissionButton>
            </Box>
        </StyledForm>
    );
};
