import Select from 'component/common/select';
import { SelectChangeEvent } from '@mui/material';
import { builtInStickinessOptions } from '../FlexibleStrategy';
import useUnleashContext from '../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';

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

    const resolveStickiness = () =>
        builtInStickinessOptions.concat(
            context
                .filter(c => c.stickiness)
                .filter(
                    c => !builtInStickinessOptions.find(s => s.key === c.name)
                )
                .map(c => ({ key: c.name, label: c.name }))
        );

    const stickinessOptions = resolveStickiness();

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
            style={{ width: 'inherit', minWidth: '100%' }}
        />
    );
};
