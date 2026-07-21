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

const options: SdkOption[] = allSdks
    .map((sdk) => ({
        ...sdk,
        group: backendNames.has(sdk.name) ? 'Backend SDKs' : 'Frontend SDKs',
    }))
    .sort(
        (a, b) =>
            a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
    );

const optionsByName = new Map<SdkName, SdkOption>(
    options.map((option) => [option.name, option]),
);

const getOptionLabel = (option: SdkOption) => option.name;
const getOptionGroup = (option: SdkOption) => option.group;
const isOptionEqualToValue = (option: SdkOption, value: SdkOption) =>
    option.name === value.name;

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
    const selectedOption = optionsByName.get(value);
    const icon = selectedOption?.icon;

    return (
        <StyledAutocompleteWrapper>
            <AutocompleteField
                label='SDK'
                size='small'
                disableClearable
                options={options}
                value={selectedOption}
                groupBy={getOptionGroup}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
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
