import { Autocomplete, Chip, TextField } from '@mui/material';
import { useProjectFeatureNames } from 'hooks/api/getters/useReleaseAgent/useProjectFeatureNames';

type FeaturePickerProps = {
    project: string;
    value: string[];
    onChange: (names: string[]) => void;
    disabled?: boolean;
};

export const FeaturePicker = ({
    project,
    value,
    onChange,
    disabled,
}: FeaturePickerProps) => {
    const { features, loading } = useProjectFeatureNames(project);
    const options = features.map((f) => f.name);

    return (
        <Autocomplete
            multiple
            size='small'
            options={options}
            value={value}
            onChange={(_, next) => onChange(next)}
            loading={loading}
            disabled={disabled}
            disableCloseOnSelect
            renderTags={(selected, getTagProps) =>
                selected.map((name, index) => (
                    <Chip
                        size='small'
                        label={name}
                        {...getTagProps({ index })}
                        key={name}
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Features in this rollout'
                    placeholder={
                        value.length === 0
                            ? 'Type to search features in this project'
                            : ''
                    }
                />
            )}
        />
    );
};
