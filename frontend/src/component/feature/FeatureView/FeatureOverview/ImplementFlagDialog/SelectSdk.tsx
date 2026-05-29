import { Autocomplete, Box, TextField, Tooltip, styled } from '@mui/material';
import {
    allSdks,
    serverSdks,
    type SdkName,
} from 'component/onboarding/dialog/sharedTypes';

interface SelectSdkProps {
    projectSdks: SdkName[];
    value: SdkName;
    onChange: (sdk: SdkName) => void;
}

const backendNames = new Set<SdkName>(serverSdks.map((s) => s.name));

type SdkOption = {
    name: SdkName;
    icon: string;
    group: string;
    suggested: boolean;
};

const StyledAutocomplete = styled(Autocomplete<SdkOption>)({
    minWidth: 160,
    maxWidth: 260,
});

const StyledOptionRow = styled('li')({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
});

const StyledSdkIcon = styled('img')({
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: 4,
});

const StyledSdkName = styled('span')({
    flex: 1,
});

const StyledSuggestedIndicator = styled(Box)(({ theme }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.text.disabled,
    flexShrink: 0,
}));

export const SelectSdk = ({ projectSdks, value, onChange }: SelectSdkProps) => {
    const suggestedSet = new Set(projectSdks);

    const options: SdkOption[] = allSdks
        .map((sdk) => ({
            ...sdk,
            group: backendNames.has(sdk.name)
                ? 'Backend SDKs'
                : 'Frontend SDKs',
            suggested: suggestedSet.has(sdk.name),
        }))
        .sort(
            (a, b) =>
                a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
        );

    return (
        <StyledAutocomplete
            options={options}
            value={options.find((opt) => opt.name === value) ?? null}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.name === val.name}
            onChange={(_, newValue) => {
                if (newValue?.name) {
                    onChange(newValue.name);
                }
            }}
            renderOption={({ key, ...props }, option) => (
                <StyledOptionRow key={key} {...props}>
                    <StyledSdkIcon src={option.icon} alt='' />
                    <StyledSdkName>{option.name}</StyledSdkName>
                    {option.suggested && (
                        <Tooltip title='SDK connected to this project'>
                            <StyledSuggestedIndicator data-testid='sdk-suggested-indicator' />
                        </Tooltip>
                    )}
                </StyledOptionRow>
            )}
            renderInput={(params) => (
                <TextField {...params} label='SDK' size='small' />
            )}
        />
    );
};
