import Select from 'component/common/select';
import { SelectChangeEvent, useTheme } from '@mui/material';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { IUnleashContextDefinition } from '../../../../../interfaces/context';

const builtInStickinessOptions = [
    { key: 'default', label: 'default' },
    { key: 'userId', label: 'userId' },
    { key: 'sessionId', label: 'sessionId' },
    { key: 'random', label: 'random' },
];
type SimpleContextDefinition = Partial<IUnleashContextDefinition>;
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
        const contextFieldNames = context.map(field => field.name);

        const mappedBuiltInOptions: SimpleContextDefinition[] =
            builtInStickinessOptions
                .filter(({ key }) => !contextFieldNames.includes(key))
                .map(({ key }) => ({
                    name: key,
                    stickiness: true,
                }));

        const mappedContextFields: SimpleContextDefinition[] = context.map(
            ({ name, stickiness }) => ({
                name,
                stickiness,
            })
        );

        const options = [...mappedBuiltInOptions, ...mappedContextFields];
        return options
            .filter(contextDefinition => contextDefinition.stickiness)
            .map(c => ({ key: c.name, label: c.name })) as OptionType[];
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
