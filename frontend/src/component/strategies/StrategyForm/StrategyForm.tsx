import React, { useState } from 'react';
import { Typography, TextField, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import PageContent from '../../common/PageContent/PageContent';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import { styles as commonStyles, FormButtons } from '../../common';
import { trim } from '../../common/util';
import StrategyParameters from './StrategyParameters/StrategyParameters';
import { useHistory } from 'react-router-dom';
import useStrategiesApi from '../../../hooks/api/actions/useStrategiesApi/useStrategiesApi';
import { IStrategy } from '../../../interfaces/strategy';
import useToast from '../../../hooks/useToast';
import useStrategies from '../../../hooks/api/getters/useStrategies/useStrategies';
import { formatUnknownError } from '../../../utils/format-unknown-error';

interface ICustomStrategyParams {
    name?: string;
    type?: string;
    description?: string;
    required?: boolean;
}

interface ICustomStrategyErrors {
    name?: string;
}

interface IStrategyFormProps {
    editMode: boolean;
    strategy: IStrategy;
}
export const StrategyForm = ({ editMode, strategy }: IStrategyFormProps) => {
    const history = useHistory();
    const [name, setName] = useState(strategy?.name || '');
    const [description, setDescription] = useState(strategy?.description || '');
    const [params, setParams] = useState<ICustomStrategyParams[]>(
        strategy?.parameters || []
    );
    const [errors, setErrors] = useState<ICustomStrategyErrors>({});
    const { createStrategy, updateStrategy } = useStrategiesApi();
    const { refetchStrategies } = useStrategies();
    const { setToastData, setToastApiError } = useToast();

    const clearErrors = () => {
        setErrors({});
    };

    const getHeaderTitle = () => {
        if (editMode) return 'Edit strategy';
        return 'Create a new strategy';
    };

    const appParameter = () => {
        setParams(prev => [...prev, {}]);
    };

    const updateParameter = (index: number, updated: object) => {
        let item = { ...params[index] };
        params[index] = Object.assign({}, item, updated);
        setParams(prev => [...prev]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parameters = (params || [])
            .filter(({ name }) => !!name)
            .map(
                ({
                    name,
                    type = 'string',
                    description = '',
                    required = false,
                }) => ({
                    name,
                    type,
                    description,
                    required,
                })
            );
        setParams(prev => [...parameters]);
        if (editMode) {
            try {
                await updateStrategy({ name, description, parameters });
                history.push(`/strategies/view/${name}`);
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'Successfully updated strategy',
                });
                refetchStrategies();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        } else {
            try {
                await createStrategy({ name, description, parameters });
                history.push(`/strategies`);
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'Successfully created new strategy',
                });
                refetchStrategies();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const handleCancel = () => history.goBack();

    return (
        <PageContent headerContent={getHeaderTitle()}>
            <ConditionallyRender
                condition={editMode}
                show={
                    <Typography variant="body1">
                        Be careful! Changing a strategy definition might also
                        require changes to the implementation in the clients.
                    </Typography>
                }
            />

            <form
                onSubmit={handleSubmit}
                className={commonStyles.contentSpacing}
                style={{ maxWidth: '400px' }}
            >
                <TextField
                    label="Strategy name"
                    name="name"
                    placeholder=""
                    disabled={editMode}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    onChange={e => {
                        clearErrors();
                        setName(trim(e.target.value));
                    }}
                    value={name}
                    variant="outlined"
                    size="small"
                />

                <TextField
                    className={commonStyles.fullwidth}
                    multiline
                    rows={2}
                    label="Description"
                    name="description"
                    placeholder=""
                    onChange={e => setDescription(e.target.value)}
                    value={description}
                    variant="outlined"
                    size="small"
                />

                <StrategyParameters
                    input={params}
                    count={params.length}
                    updateParameter={updateParameter}
                />
                <Button
                    onClick={e => {
                        e.preventDefault();
                        appParameter();
                    }}
                    startIcon={<Add />}
                >
                    Add parameter
                </Button>

                <ConditionallyRender
                    condition={editMode}
                    show={
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ display: 'block' }}
                        >
                            Update
                        </Button>
                    }
                    elseShow={
                        <FormButtons
                            submitText={'Create'}
                            onCancel={handleCancel}
                        />
                    }
                />
            </form>
        </PageContent>
    );
};
