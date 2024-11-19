import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

interface IReleasePlanTemplateAddStrategyFormProps {
    onCancel: () => void;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    onCancel,
}: IReleasePlanTemplateAddStrategyFormProps) => {
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
