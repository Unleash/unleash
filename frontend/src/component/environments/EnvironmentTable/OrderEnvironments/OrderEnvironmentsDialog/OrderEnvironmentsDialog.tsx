import { useState, type FC } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    styled,
    Typography,
} from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { OrderEnvironmentsDialogPricing } from './OrderEnvironmentsDialogPricing/OrderEnvironmentsDialogPricing';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import type { IFormErrors } from 'hooks/useFormErrors';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

type OrderEnvironmentsDialogProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (environments: string[]) => void;
    errors?: IFormErrors;
};

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

const StyledTitle = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const StyledGeneralSelect = styled(GeneralSelect)(({ theme }) => ({
    margin: theme.spacing(1, 0),
}));

const StyledFields = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(3),
}));

const StyledEnvironmentNameInputs = styled('fieldset')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: 'none',
    padding: 0,
    margin: 0,
    gap: theme.spacing(1.5),
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    marginBottom: theme.spacing(0.4),
}));

const PRICE = 10;
const OPTIONS = [1, 2, 3];

export const OrderEnvironmentsDialog: FC<OrderEnvironmentsDialogProps> = ({
    open,
    onClose,
    onSubmit,
    errors,
}) => {
    const { trackEvent } = usePlausibleTracker();
    const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
    const [costCheckboxChecked, setCostCheckboxChecked] = useState(false);
    const [environmentNames, setEnvironmentNames] = useState<string[]>(['']);

    const trackEnvironmentSelect = () => {
        trackEvent('order-environments', {
            props: {
                eventType: 'selected environment count',
            },
        });
    };

    return (
        <StyledDialog open={open} title=''>
            <FormTemplate
                compact
                description={
                    <OrderEnvironmentsDialogPricing
                        pricingOptions={OPTIONS.map((option) => ({
                            environments: option,
                            price: option * PRICE,
                        }))}
                    />
                }
                footer={
                    <StyledFooter>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant='contained'
                            disabled={!costCheckboxChecked}
                            onClick={() => onSubmit(environmentNames)}
                        >
                            Order
                        </Button>
                    </StyledFooter>
                }
            >
                <StyledTitle>
                    <Typography variant='h3' component='div'>
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
                        <Typography
                            component='label'
                            htmlFor='numberOfEnvironments'
                        >
                            Select the number of additional environments
                        </Typography>
                        <StyledGeneralSelect
                            id='numberOfEnvironments'
                            value={`${selectedOption}`}
                            options={OPTIONS.map((option) => ({
                                key: `${option}`,
                                label: `${option} environment${option > 1 ? 's' : ''}`,
                            }))}
                            onChange={(option) => {
                                const value = Number.parseInt(option, 10);
                                setSelectedOption(value);
                                setEnvironmentNames((names) =>
                                    [...names, ...Array(value).fill('')].slice(
                                        0,
                                        value,
                                    ),
                                );
                                trackEnvironmentSelect();
                            }}
                        />
                    </Box>
                    <StyledEnvironmentNameInputs>
                        <Typography>
                            How would you like the environment
                            {selectedOption > 1 ? 's' : ''} to be named?
                        </Typography>
                        {[...Array(selectedOption)].map((_, i) => {
                            const error = errors?.getFormError(
                                `environment-${i}`,
                            );

                            return (
                                <Input
                                    key={i}
                                    label={`Environment ${i + 1} name`}
                                    value={environmentNames[i]}
                                    onChange={(event) => {
                                        setEnvironmentNames((names) => {
                                            const newValues = [...names];
                                            newValues[i] = event.target.value;
                                            return newValues;
                                        });
                                    }}
                                    error={Boolean(error)}
                                    errorText={error}
                                />
                            );
                        })}
                    </StyledEnvironmentNameInputs>
                    <Box>
                        <StyledCheckbox
                            edge='start'
                            id='costsCheckbox'
                            checked={costCheckboxChecked}
                            onChange={() =>
                                setCostCheckboxChecked((state) => !state)
                            }
                        />
                        <Typography component='label' htmlFor='costsCheckbox'>
                            I understand adding environments leads to extra
                            costs
                        </Typography>
                    </Box>
                </StyledFields>
            </FormTemplate>
        </StyledDialog>
    );
};
