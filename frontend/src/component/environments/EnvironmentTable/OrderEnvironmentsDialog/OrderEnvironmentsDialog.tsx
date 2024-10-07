import type { FC } from 'react';
import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { OrderEnvironmentsDialogPricing } from './OrderEnvironmentsDialogPricing/OrderEnvironmentsDialogPricing';
import GeneralSelect, {
    type ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';

type OrderEnvironmentsDialogProps = {
    open: boolean;
    onClose: () => void;
};

const PRICE = '10';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    maxWidth: '940px',
    margin: 'auto',
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusExtraLarge,
        maxWidth: theme.spacing(170),
        width: '100%',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledFooter = styled(Typography)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const StyledFields = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(3),
}));

export const OrderEnvironmentsDialog: FC<OrderEnvironmentsDialogProps> = ({
    open,
    onClose,
}) => {
    const options: ISelectOption[] = [{ key: '1', label: '1 environment' }];

    return (
        <StyledDialog open={open} title=''>
            <FormTemplate
                compact
                description={<OrderEnvironmentsDialogPricing />}
                footer={
                    <StyledFooter>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button variant='contained'>Order</Button>
                    </StyledFooter>
                }
            >
                <StyledTitle>
                    <Typography variant='h3'>
                        Order additional environments
                    </Typography>
                </StyledTitle>
                <Typography variant='body2' color='text.secondary'>
                    With our PRO plan, you have the flexibility to expand your
                    workspace by adding environments at ${PRICE} per user per
                    month.
                </Typography>
                <StyledFields>
                    <Box>
                        <Typography>Select number of environments</Typography>
                        <GeneralSelect
                            value={options[0].key}
                            options={options}
                            onChange={() => {}}
                        />
                    </Box>
                    <Box>
                        <Typography>
                            What would you like the environment(s) to be named?
                        </Typography>
                        <Input
                            label='Environment 1 name'
                            value=''
                            onChange={() => {}}
                        />
                    </Box>
                    <Box>
                        <Typography>
                            I understand adding environments leads to extra
                            costs
                        </Typography>
                    </Box>
                </StyledFields>
            </FormTemplate>
        </StyledDialog>
    );
};
