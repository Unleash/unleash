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
                <StyledSignupDialogLabel>
                    What's your name?
                </StyledSignupDialogLabel>
                <StyledSignupDialogTextField
                    variant='outlined'
                    placeholder='Enter full name'
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
                        'Engineering Manager',
                        'Product Manager',
                        'Designer/UX',
                        'DevOps Engineer',
                        'QA/Test Engineer',
                        'Executive',
                        'Other',
                    ]}
                    renderInput={(params) => (
                        <StyledSignupDialogTextField
                            {...params}
                            placeholder='Please select'
                            helperText={`Different roles use feature flags differently. Let's focus your onboarding on what's relevant to you`}
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
