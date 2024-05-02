import Select from 'component/common/select';
import { type SelectChangeEvent, useTheme } from '@mui/material';
import { useStickinessOptions } from 'hooks/useStickinessOptions';

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
    const theme = useTheme();
    const stickinessOptions = useStickinessOptions(value);

    return (
        <Select
            id='stickiness-select'
            name='stickiness'
            label={label}
            options={stickinessOptions}
            value={value}
            disabled={!editable}
            data-testid={dataTestId}
            onChange={onChange}
            style={{
                minWidth: '100%',
                marginBottom: theme.spacing(2),
            }}
            formControlStyles={{ width: '100%' }}
        />
    );
};
