import Select from 'component/common/select';
import { SelectChangeEvent } from '@mui/material';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
const builtInStickinessOptions = [
    { key: 'default', label: 'default' },
    { key: 'userId', label: 'userId' },
    { key: 'sessionId', label: 'sessionId' },
    { key: 'random', label: 'random' },
];

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

    const resolveStickinessOptions = () =>
        builtInStickinessOptions.concat(
            context
                .filter(contextDefinition => contextDefinition.stickiness)
                .filter(
                    contextDefinition =>
                        !builtInStickinessOptions.find(
                            builtInStickinessOption =>
                                builtInStickinessOption.key ===
                                contextDefinition.name
                        )
                )
                .map(c => ({ key: c.name, label: c.name }))
        );

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
            style={{ width: 'inherit', minWidth: '100%' }}
        />
    );
};
