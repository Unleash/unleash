import Select from 'component/common/select';
import { SelectChangeEvent, useTheme } from '@mui/material';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';

type OptionType = { key: string; label: string };

interface IStickinessSelectProps {
    label: string;
    value: string | undefined;
    editable: boolean;
    onChange: (event: SelectChangeEvent) => void;
    dataTestId?: string;
}
export const StickinessSelect = ({
    label,
    editable,
    value,
    onChange,
    dataTestId,
}: IStickinessSelectProps) => {
    const { context } = useUnleashContext();
    const theme = useTheme();

    const resolveStickinessOptions = () => {
        const options = context
            .filter(field => field.stickiness)
            .map(c => ({ key: c.name, label: c.name })) as OptionType[];

        if (!options.find(option => option.key === 'default')) {
            options.push({ key: 'default', label: 'default' });
        }

        if (!options.find(option => option.key === 'random')) {
            options.push({ key: 'random', label: 'random' });
        }

        return options;
    };

    const stickinessOptions = resolveStickinessOptions();
    return (
        <Select
            id="stickiness-select"
            name="stickiness"
            label={label}
            options={stickinessOptions}
            value={value}
            disabled={!editable}
            data-testid={dataTestId}
            onChange={onChange}
            style={{
                width: 'inherit',
                minWidth: '100%',
                marginBottom: theme.spacing(2),
            }}
        />
    );
};
