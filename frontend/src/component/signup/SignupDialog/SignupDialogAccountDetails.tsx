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

const StyledCheckboxContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& .MuiFormControlLabel-label': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

export const SignupDialogAccountDetails: SignupStepContent = ({
    data,
    setData,
    onNext,
    signupData,
}) => {
    const requestCompanyData = !signupData?.companyName;

    const isValidForm =
        data.name.trim() !== '' &&
        data.companyRole.trim() !== '' &&
        (!requestCompanyData || data.companyName.trim() !== '');

    return (
        <>
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>Name</StyledSignupDialogLabel>
                <StyledSignupDialogTextField
                    variant='outlined'
                    placeholder='Name'
                    name='name'
                    autoComplete='name'
                    value={data.name}
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                />
            </StyledSignupDialogField>
            <StyledSignupDialogField>
                <StyledSignupDialogLabel>
                    What's your role?
                </StyledSignupDialogLabel>
                <Autocomplete
                    openOnFocus
                    value={data.companyRole === '' ? null : data.companyRole}
                    onChange={(_, role) =>
                        setData((prev) => ({
                            ...prev,
                            companyRole: role ?? '',
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
            {requestCompanyData && (
                <StyledSignupDialogField>
                    <StyledSignupDialogLabel>
                        Company name
                    </StyledSignupDialogLabel>
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
            )}
            <StyledCheckboxContainer>
                {requestCompanyData && (
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
                )}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={data.productUpdatesEmailConsent}
                            onChange={() =>
                                setData((prev) => ({
                                    ...prev,
                                    productUpdatesEmailConsent:
                                        !prev.productUpdatesEmailConsent,
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
