import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

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
    permission: string;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    onCancel,
    permission,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    return (
        <FormTemplate
            modal
            description='Add a strategy to your release plan template.'
        >
            <StyledButtonContainer>
                <PermissionButton
                    permission={permission}
                    variant='contained'
                    color='primary'
                    type='submit'
                >
                    Save strategy
                </PermissionButton>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
