import { AutocompleteField } from 'component/common/AutocompleteField/AutocompleteField';

interface IProjectActionsActionParameterAutocompleteProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

export const ProjectActionsActionParameterAutocomplete = ({
    label,
    value,
    onChange,
    options,
}: IProjectActionsActionParameterAutocompleteProps) => (
    <AutocompleteField
        label={label}
        size='small'
        options={options}
        autoHighlight
        autoSelect
        value={value}
        onInputChange={(_, parameter) => onChange(parameter)}
    />
);
