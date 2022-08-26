import { Button, styled } from '@mui/material';
import { VFC } from 'react';
import { formatApiPath } from 'utils/formatPath';

const PORTAL_URL = formatApiPath('api/admin/invoices');

const StyledButton = styled(Button)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(1.5),
}));

interface IBillingInformationButtonProps {
    update?: boolean;
}

export const BillingInformationButton: VFC<IBillingInformationButtonProps> = ({
    update,
}) => (
    <StyledButton
        href={`${PORTAL_URL}/${update ? 'portal' : 'checkout'}`}
        variant={update ? 'outlined' : 'contained'}
    >
        {update ? 'Update billing information' : 'Add billing information'}
    </StyledButton>
);
