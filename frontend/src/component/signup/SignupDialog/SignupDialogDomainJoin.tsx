import { Button, styled } from '@mui/material';
import type { SignupStepContent } from './SignupDialog';
import { AutoCreateDomainUsersToggle } from 'component/admin/users/AutoCreateDomainUsersToggle';

const StyledButtonRow = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
});

export const SignupDialogDomainJoin: SignupStepContent = ({ onNext }) => (
    <>
        <AutoCreateDomainUsersToggle />
        <StyledButtonRow>
            <Button variant='contained' onClick={() => onNext()}>
                Continue
            </Button>
        </StyledButtonRow>
    </>
);
