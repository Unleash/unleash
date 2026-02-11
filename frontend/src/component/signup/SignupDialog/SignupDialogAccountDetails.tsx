import {
    Autocomplete,
    Checkbox,
    FormControlLabel,
    styled,
} from '@mui/material';
import {
    StyledSignupDialogButton,
    StyledSignupDialogField,
    StyledSignupDialogLabel,
    StyledSignupDialogTextField,
    type SignupStepContent,
} from './SignupDialog';

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    width: '100%',
}));

const StyledCheckboxContainer = styled('div')(({ theme }) => ({
    '& .MuiFormControlLabel-label': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

export const SignupDialogAccountDetails: SignupStepContent = ({
    data,
    setData,
    onNext,
}) => {
    const isValidForm =
        data.firstName.trim() !== '' &&
        data.lastName.trim() !== '' &&
        data.companyRole.trim() !== '' &&
        data.companyName.trim() !== '';

    return (
        <>
            <StyledRow>
                <StyledSignupDialogField>
                    <StyledSignupDialogLabel>
                        First name
                    </StyledSignupDialogLabel>
                    <StyledSignupDialogTextField
                        variant='outlined'
                        placeholder='First name'
                        name='given-name'
                        autoComplete='given-name'
                        value={data.firstName}
                        onChange={(e) =>
                            setData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                            }))
                        }
                    />
                </StyledSignupDialogField>
                <StyledSignupDialogField>
                    <StyledSignupDialogLabel>Last name</StyledSignupDialogLabel>
                    <StyledSignupDialogTextField
                        variant='outlined'
                        placeholder='Last name'
                        name='family-name'
                        autoComplete='family-name'
                        value={data.lastName}
                        onChange={(e) =>
                            setData((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                            }))
                        }
                    />
                </StyledSignupDialogField>
            </StyledRow>
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>
                    What's your role?
                </StyledSignupDialogLabel>
                <Autocomplete
                    openOnFocus
                    value={data.companyRole}
                    onChange={(_, role) =>
                        setData((prev) => ({
                            ...prev,
                            companyRole: role || '',
                        }))
                    }
                    options={[
                        'Developer',
                        'DevOps',
                        'Engineering manager',
                        'Product manager',
                        'Other',
                    ]}
                    renderInput={(params) => (
                        <StyledSignupDialogTextField
                            {...params}
                            placeholder='Please select'
                            helperText='We use this to customize your onboarding'
                        />
                    )}
                />
            </StyledSignupDialogField>
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>Company name</StyledSignupDialogLabel>
                <StyledSignupDialogTextField
                    variant='outlined'
                    placeholder='Company name'
                    helperText='This is displayed when people join your workspace'
                    name='organization'
                    autoComplete='organization'
                    value={data.companyName}
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                        }))
                    }
                />
            </StyledSignupDialogField>
            <StyledCheckboxContainer>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={data.companyIsNA}
                            onChange={() =>
                                setData((prev) => ({
                                    ...prev,
                                    companyIsNA: !prev.companyIsNA,
                                }))
                            }
                            color='primary'
                        />
                    }
                    label='My company is based in North America'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={data.emailSubscription}
                            onChange={() =>
                                setData((prev) => ({
                                    ...prev,
                                    emailSubscription: !prev.emailSubscription,
                                }))
                            }
                            color='primary'
                        />
                    }
                    label='I would like to receive product updates by email'
                />
            </StyledCheckboxContainer>
            <StyledSignupDialogButton
                variant='contained'
                onClick={onNext}
                disabled={!isValidForm}
            >
                Next
            </StyledSignupDialogButton>
        </>
    );
};
