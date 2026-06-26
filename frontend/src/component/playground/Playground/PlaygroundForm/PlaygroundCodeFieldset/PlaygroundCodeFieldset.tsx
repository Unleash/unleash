import {
    type Dispatch,
    type FC,
    type FormEvent,
    type SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    useTheme,
    Autocomplete,
    Checkbox,
    styled,
} from '@mui/material';
import { FormField } from 'component/common/FormField/FormField';
import { FormGroup } from 'component/common/FormGroup/FormGroup';

import debounce from 'debounce';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { PlaygroundEditor } from './PlaygroundEditor/PlaygroundEditor.tsx';
import { parseDateValue, parseValidDate } from 'component/common/util';
import {
    isStringOrStringArray,
    normalizeCustomContextProperties,
} from '../../playground.utils';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useFullUnleashContext } from 'hooks/api/getters/useUnleashContext/useFullUnleashContext.ts';
import type { IUnleashContextDefinition } from 'interfaces/context.ts';
import type { SelectOptionGroup } from 'component/common/GeneralSelect/GeneralSelect.tsx';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect.tsx';

interface IPlaygroundCodeFieldsetProps {
    context: string | undefined;
    setContext: Dispatch<SetStateAction<string | undefined>>;
}

// The "add a context value" row: field select, value input and the add button.
const StyledValueRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '200px 1fr auto',
    gap: theme.spacing(2),
    // Bottom-align so the button sits on the inputs' baseline, not the labels.
    alignItems: 'end',
    // Spacing is owned by the grid; drop the FormFields' own bottom margins.
    '&& > *': {
        marginBottom: 0,
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
    },
}));

const createContextFieldOptions = (
    context: IUnleashContextDefinition[],
): SelectOptionGroup[] => {
    const optList = (opts: { name: string; sortOrder: number }[]) =>
        opts
            .toSorted((a, b) => a.sortOrder - b.sortOrder)
            .map((option) => ({
                key: option.name,
                label: option.name,
            }));

    const fields = context.reduce(
        ({ project, global }, next) => {
            if (next.project) {
                project.push(next);
            } else {
                global.push(next);
            }
            return { project: project, global: global };
        },
        {
            project: [] as IUnleashContextDefinition[],
            global: [] as IUnleashContextDefinition[],
        },
    );

    const groups: SelectOptionGroup[] = [];

    if (fields.project.length) {
        groups.push({
            groupHeader: 'Project context fields',
            options: optList(fields.project),
        });
    }
    if (fields.global.length) {
        groups.push({
            groupHeader: 'Global context fields',
            options: optList(fields.global),
        });
    }

    return groups;
};

export const PlaygroundCodeFieldset: FC<IPlaygroundCodeFieldsetProps> = ({
    context,
    setContext,
}) => {
    const theme = useTheme();
    const { setToastData } = useToast();
    const { context: contextData } = useFullUnleashContext();

    const contextOptions = createContextFieldOptions(contextData);

    const [error, setError] = useState<string>();
    const [fieldExist, setFieldExist] = useState<boolean>(false);
    const [contextField, setContextField] = useState<string>('');
    const [contextValue, setContextValue] = useState<string>('');
    const debounceJsonParsing = useMemo(
        () =>
            debounce((input?: string) => {
                if (!input) {
                    return setError(undefined);
                }

                try {
                    const contextValue = JSON.parse(input);

                    setFieldExist(
                        contextValue[contextField] !== undefined ||
                            contextValue?.properties?.[contextField] !==
                                undefined,
                    );
                } catch (error: unknown) {
                    return setError(formatUnknownError(error));
                }

                return setError(undefined);
            }, 250),
        [setError, contextField, setFieldExist],
    );

    useEffect(() => {
        debounceJsonParsing(context);
    }, [debounceJsonParsing, context]);

    const onAddField = () => {
        try {
            const currentValue = JSON.parse(context || '{}');

            setContext(
                JSON.stringify(
                    normalizeCustomContextProperties({
                        ...currentValue,
                        [contextField]: contextValue,
                    }),
                    null,
                    2,
                ),
            );

            const foundContext = contextData.find(
                (context) => context.name === contextField,
            );

            if (
                (foundContext?.legalValues &&
                    foundContext.legalValues.length > 0) ||
                contextField === 'currentTime'
            ) {
                return setContextValue('');
            }
        } catch (error) {
            setToastData({
                type: 'error',
                text: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    const changeContextValue = (
        _e: FormEvent,
        newValue: string | (string | string[])[] | null,
    ) => {
        if (!isStringOrStringArray(newValue)) return;

        if (Array.isArray(newValue)) {
            const temp =
                (newValue || []).length > 1 ? newValue.join(',') : newValue[0];
            return setContextValue(temp);
        }

        setContextValue(newValue);
    };

    const resolveAutocompleteValue = (): string[] => {
        //This is needed for clearing the Autocomplete Chips when changing the context field
        //and the new field also has legal values
        if (!contextValue || contextValue === '') {
            return [];
        }

        // Split comma separated strings to array for fields with legal values
        const foundField = contextData.find(
            (contextData) => contextData.name === contextField,
        );
        const hasLegalValues = (foundField?.legalValues || []).length > 1;
        if (contextValue.includes(',') && hasLegalValues) {
            return contextValue.split(',');
        }

        return [contextValue as string];
    };

    const resolveInput = () => {
        if (contextField === 'currentTime') {
            const validDate = parseValidDate(contextValue);
            const now = new Date();

            const value = validDate
                ? parseDateValue(validDate.toISOString())
                : parseDateValue(now.toISOString());
            return (
                <TextField
                    id='date'
                    size='large'
                    type='datetime-local'
                    value={value}
                    fullWidth
                    onChange={(e) => {
                        const parsedDate = parseValidDate(e.target.value);
                        const dateString = parsedDate?.toISOString();
                        dateString && setContextValue(dateString);
                    }}
                    required
                />
            );
        }
        const foundField = contextData.find(
            (contextData) => contextData.name === contextField,
        );
        if (foundField?.legalValues && foundField.legalValues.length > 0) {
            const options = foundField.legalValues.map(({ value }) => value);

            return (
                <Autocomplete
                    disablePortal
                    limitTags={3}
                    id='context-legal-values'
                    multiple={true}
                    options={options}
                    disableCloseOnSelect
                    size='large'
                    value={resolveAutocompleteValue()}
                    onChange={changeContextValue}
                    getOptionLabel={(option) => option}
                    renderOption={(props, option, { selected }) => {
                        return (
                            <li {...props}>
                                <Checkbox
                                    icon={
                                        <CheckBoxOutlineBlank fontSize='small' />
                                    }
                                    checkedIcon={
                                        <CheckBoxIcon fontSize='small' />
                                    }
                                    sx={(theme) => ({
                                        marginRight: theme.spacing(0.5),
                                    })}
                                    checked={selected}
                                />
                                {option}
                            </li>
                        );
                    }}
                    fullWidth
                    renderInput={(params) => <TextField {...params} />}
                />
            );
        }

        return (
            <TextField
                id='context-value'
                fullWidth
                placeholder={'value1,value2,value3'}
                size='large'
                value={contextValue}
                onChange={(event) => setContextValue(event.target.value || '')}
            />
        );
    };

    const changeContextField = (value: string) => {
        setContextField(value || '');

        if (value === 'currentTime') {
            return setContextValue(new Date().toISOString());
        }

        setContextValue('');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant='body2'
                    color={theme.palette.text.primary}
                    sx={{ ml: 1, fontWeight: 'bold' }}
                >
                    Unleash context
                </Typography>
            </Box>

            <FormGroup>
                <StyledValueRow>
                    <FormField label='Context field'>
                        <GeneralSelect
                            value={contextField}
                            onChange={changeContextField}
                            options={contextOptions}
                            fullWidth
                        />
                    </FormField>
                    <FormField
                        label={
                            contextField === 'currentTime' ? 'Date' : 'Value'
                        }
                    >
                        {resolveInput()}
                    </FormField>
                    {/* Spacer label aligns the button with the inputs, not the
                        labels above them. */}
                    <FormField label={' '}>
                        <Button
                            variant='outlined'
                            disabled={!contextField || Boolean(error)}
                            onClick={onAddField}
                        >
                            {fieldExist ? 'Replace' : 'Add'}
                        </Button>
                    </FormField>
                </StyledValueRow>

                <PlaygroundEditor
                    context={context}
                    setContext={setContext}
                    error={error}
                />
            </FormGroup>
        </Box>
    );
};
