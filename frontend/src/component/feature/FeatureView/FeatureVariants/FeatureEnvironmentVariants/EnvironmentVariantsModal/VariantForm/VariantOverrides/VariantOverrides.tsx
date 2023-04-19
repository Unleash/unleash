import { ChangeEvent, VFC } from 'react';
import { IconButton, styled, TextField, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Autocomplete } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { InputListField } from 'component/common/InputListField/InputListField';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { IOverride } from 'interfaces/featureToggle';
import { OverridesDispatchType } from './useOverrides';
import SelectMenu from 'component/common/select';

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    rowGap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        '& > div, .MuiInputBase-root': {
            width: '100%',
            alignItems: 'flex-start',
        },
    },
}));

const StyledSelectMenu = styled(SelectMenu)(({ theme }) => ({
    marginRight: theme.spacing(10),
    [theme.breakpoints.up('sm')]: {
        minWidth: theme.spacing(20),
    },
}));

const StyledFieldColumn = styled('div')(({ theme }) => ({
    width: '100%',
    gap: theme.spacing(1.5),
    display: 'flex',
}));

const StyledInputListField = styled(InputListField)(() => ({
    width: '100%',
}));

const StyledTextField = styled(TextField)(() => ({
    width: '100%',
}));

interface IOverrideConfigProps {
    overrides: IOverride[];
    overridesDispatch: OverridesDispatchType;
}

export const OverrideConfig: VFC<IOverrideConfigProps> = ({
    overrides,
    overridesDispatch,
}) => {
    const { context } = useUnleashContext();
    const contextNames = context.map(({ name }) => ({
        key: name,
        label: name,
    }));

    const updateValues = (index: number) => (values: string[]) => {
        overridesDispatch({
            type: 'UPDATE_VALUES_AT',
            payload: [index, values],
        });
    };

    const updateSelectValues =
        (index: number) => (event: ChangeEvent<unknown>, options: string[]) => {
            event?.preventDefault();
            overridesDispatch({
                type: 'UPDATE_VALUES_AT',
                payload: [index, options ? options : []],
            });
        };

    return (
        <>
            {overrides.map((override, index) => {
                const definition = context.find(
                    ({ name }) => name === override.contextName
                );
                const legalValues =
                    definition?.legalValues?.map(({ value }) => value) || [];
                const filteredValues = override.values.filter(value =>
                    legalValues.includes(value)
                );

                return (
                    <StyledRow key={`override=${index}`}>
                        <StyledSelectMenu
                            id="override-context-name"
                            name="contextName"
                            label="Context Field"
                            data-testid="context_field"
                            value={override.contextName}
                            options={contextNames}
                            onChange={e =>
                                overridesDispatch({
                                    type: 'UPDATE_TYPE_AT',
                                    payload: [index, e.target.value],
                                })
                            }
                        />
                        <StyledFieldColumn>
                            <ConditionallyRender
                                condition={Boolean(
                                    legalValues && legalValues.length > 0
                                )}
                                show={
                                    <Autocomplete
                                        multiple
                                        id={`override-select-${index}`}
                                        isOptionEqualToValue={(
                                            option,
                                            value
                                        ) => {
                                            return option === value;
                                        }}
                                        options={legalValues}
                                        onChange={updateSelectValues(index)}
                                        getOptionLabel={option => option}
                                        value={filteredValues}
                                        style={{ width: '100%' }}
                                        filterSelectedOptions
                                        size="small"
                                        renderInput={params => (
                                            <StyledTextField
                                                {...params}
                                                variant="outlined"
                                                label="Legal values"
                                            />
                                        )}
                                    />
                                }
                                elseShow={
                                    <StyledInputListField
                                        label="Values (v1, v2, ...)"
                                        name="values"
                                        placeholder=""
                                        values={override.values}
                                        updateValues={updateValues(index)}
                                        data-testid="OVERRIDE_VALUES"
                                    />
                                }
                            />
                            <Tooltip title="Remove" arrow>
                                <IconButton
                                    onClick={event => {
                                        event.preventDefault();
                                        overridesDispatch({
                                            type: 'REMOVE',
                                            payload: index,
                                        });
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </StyledFieldColumn>
                    </StyledRow>
                );
            })}
        </>
    );
};
