import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(20),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

export const ReleasePlanTemplateAddStrategyForm = ({
    onCancel,
}: { onCancel: () => void }) => {
    return (
        <FormTemplate
            modal
            description='Add a strategy to your release plan template.'
        >
            <StyledButtonContainer>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
