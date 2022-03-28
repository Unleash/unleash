import { TextField } from '@material-ui/core';
import {
    IAddonConfig,
    IAddonProvider,
    IAddonProviderParams,
} from 'interfaces/addons';

const resolveType = ({ type = 'text', sensitive = false }, value: string) => {
    if (sensitive && value === MASKED_VALUE) {
        return 'text';
    }
    if (type === 'textfield') {
        return 'text';
    }
    return type;
};

const MASKED_VALUE = '*****';

interface IAddonParameterProps {
    provider: IAddonProvider;
    errors: Record<string, string>;
    definition: IAddonProviderParams;
    setParameterValue: (param: string) => void;
    config: IAddonConfig;
}

export const AddonParameter = ({
    definition,
    config,
    errors,
    setParameterValue,
}: IAddonParameterProps) => {
    const value = config.parameters[definition.name] || '';
    const type = resolveType(definition, value);
    // @ts-expect-error
    const error = errors.parameters[definition.name];

    return (
        <div style={{ width: '80%', marginTop: '25px' }}>
            <TextField
                size="small"
                style={{ width: '100%' }}
                rows={definition.type === 'textfield' ? 9 : 0}
                multiline={definition.type === 'textfield'}
                type={type}
                label={definition.displayName}
                name={definition.name}
                placeholder={definition.placeholder || ''}
                InputLabelProps={{
                    shrink: true,
                }}
                value={value}
                error={error}
                // @ts-expect-error
                onChange={setParameterValue(definition.name)}
                variant="outlined"
                helperText={definition.description}
            />
        </div>
    );
};
