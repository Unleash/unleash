import { ChangeEvent, VFC } from 'react';
import classnames from 'classnames';
import { Grid, IconButton, TextField, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useStyles } from './OverrideConfig.styles';
import { Autocomplete } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useThemeStyles } from 'themes/themeStyles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { InputListField } from 'component/common/InputListField/InputListField';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { IOverride } from 'interfaces/featureToggle';
import { OverridesDispatchType } from '../useOverrides';

interface IOverrideConfigProps {
    overrides: IOverride[];
    overridesDispatch: OverridesDispatchType;
}

export const OverrideConfig: VFC<IOverrideConfigProps> = ({
    overrides,
    overridesDispatch,
}) => {
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();

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
                    c => c.name === override.contextName
                );
                const legalValues =
                    definition?.legalValues?.map(({ value }) => value) || [];
                const filteredValues = override.values.filter(value =>
                    legalValues.includes(value)
                );

                return (
                    <Grid
                        container
                        key={`override=${index}`}
                        alignItems="center"
                    >
                        <Grid
                            item
                            md={3}
                            sm={3}
                            xs={3}
                            className={styles.contextFieldSelect}
                        >
                            <GeneralSelect
                                name="contextName"
                                label="Context Field"
                                value={override.contextName}
                                options={contextNames}
                                classes={{
                                    root: classnames(themeStyles.fullWidth),
                                }}
                                onChange={(value: string) => {
                                    overridesDispatch({
                                        type: 'UPDATE_TYPE_AT',
                                        payload: [index, value],
                                    });
                                }}
                            />
                        </Grid>
                        <Grid md={7} sm={7} xs={6} item>
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
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label="Legal values"
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    />
                                }
                                elseShow={
                                    <InputListField
                                        label="Values (v1, v2, ...)"
                                        name="values"
                                        placeholder=""
                                        values={override.values}
                                        updateValues={updateValues(index)}
                                    />
                                }
                            />
                        </Grid>
                        <Grid item md={1}>
                            <Tooltip title="Remove" arrow>
                                <IconButton
                                    onClick={event => {
                                        event.preventDefault();
                                        overridesDispatch({
                                            type: 'REMOVE',
                                            payload: index,
                                        });
                                    }}
                                    size="large"
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                );
            })}
        </>
    );
};
