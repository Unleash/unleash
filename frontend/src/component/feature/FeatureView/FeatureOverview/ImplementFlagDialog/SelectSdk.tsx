import { styled } from '@mui/material';
import { AutocompleteField } from 'component/common/AutocompleteField/AutocompleteField';
import {
    allSdks,
    serverSdks,
    type SdkName,
} from 'component/onboarding/dialog/sharedTypes';
import { formatAssetPath } from 'utils/formatPath';

interface SelectSdkProps {
    value: SdkName;
    onChange: (sdk: SdkName) => void;
}

const backendNames = new Set<SdkName>(serverSdks.map((s) => s.name));

type SdkOption = {
    name: SdkName;
    icon: UnformattedAssetPath;
    group: string;
};

const StyledAutocompleteWrapper = styled('div')(({ theme }) => ({
    minWidth: theme.spacing(20),
    maxWidth: theme.spacing(32.5),
}));

const StyledOptionRow = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledSdkIcon = styled('img')(({ theme }) => ({
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    flexShrink: 0,
    borderRadius: theme.shape.borderRadiusSmall,
    marginLeft: theme.spacing(0.5),
}));

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

    const icon = options.find((opt) => opt.name === value)?.icon;

    return (
        <StyledAutocompleteWrapper>
            <AutocompleteField
                label='SDK'
                size='small'
                disableClearable
                options={options}
                value={options.find((opt) => opt.name === value)}
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
                        <StyledSdkIcon
                            src={formatAssetPath(option.icon)}
                            alt=''
                        />
                        <StyledSdkName>{option.name}</StyledSdkName>
                    </StyledOptionRow>
                )}
                startAdornment={
                    icon && (
                        <StyledSdkIcon
                            src={formatAssetPath(icon)}
                            alt='sdk-icon'
                        />
                    )
                }
            />
        </StyledAutocompleteWrapper>
    );
};
