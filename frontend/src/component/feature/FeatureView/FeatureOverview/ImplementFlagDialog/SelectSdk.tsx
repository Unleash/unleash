import { Autocomplete, TextField, styled } from '@mui/material';
import {
    allSdks,
    serverSdks,
    type SdkName,
} from 'component/onboarding/dialog/sharedTypes';

interface SelectSdkProps {
    value: SdkName;
    onChange: (sdk: SdkName) => void;
}

const backendNames = new Set<SdkName>(serverSdks.map((s) => s.name));

type SdkOption = {
    name: SdkName;
    icon: string;
    group: string;
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

export const SelectSdk = ({ value, onChange }: SelectSdkProps) => {
    const options: SdkOption[] = allSdks
        .map((sdk) => ({
            ...sdk,
            group: backendNames.has(sdk.name)
                ? 'Backend SDKs'
                : 'Frontend SDKs',
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
                </StyledOptionRow>
            )}
            renderInput={(params) => (
                <TextField {...params} label='SDK' size='small' />
            )}
        />
    );
};
