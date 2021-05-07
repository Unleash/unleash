import PropTypes from 'prop-types';

import { Typography, TextField, Button, Icon } from '@material-ui/core';

import PageContent from '../../common/PageContent/PageContent';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import { styles as commonStyles, FormButtons } from '../../common';
import { trim } from '../../common/util';
import StrategyParameters from './StrategyParameters/StrategyParameters';

const CreateStrategy = ({
    input,
    setValue,
    appParameter,
    onCancel,
    editMode = false,
    errors,
    onSubmit,
    clearErrors,
    updateParameter,
}) => {
    const getHeaderTitle = () => {
        if (editMode) return 'Edit strategy';
        return 'Create a new strategy';
    };

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
                onSubmit={onSubmit}
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
                    onChange={({ target }) => {
                        clearErrors();
                        setValue('name', trim(target.value));
                    }}
                    value={input.name}
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
                    onChange={({ target }) =>
                        setValue('description', target.value)
                    }
                    value={input.description}
                    variant="outlined"
                    size="small"
                />

                <StrategyParameters
                    input={input.parameters}
                    count={input.parameters.length}
                    updateParameter={updateParameter}
                />
                <Button
                    onClick={e => {
                        e.preventDefault();
                        appParameter();
                    }}
                    startIcon={<Icon>add</Icon>}
                >
                    Add parameter
                </Button>

                <FormButtons
                    submitText={editMode ? 'Update' : 'Create'}
                    onCancel={onCancel}
                />
            </form>
        </PageContent>
    );
};

CreateStrategy.propTypes = {
    input: PropTypes.object,
    setValue: PropTypes.func,
    appParameter: PropTypes.func,
    updateParameter: PropTypes.func,
    clear: PropTypes.func,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    errors: PropTypes.object,
    editMode: PropTypes.bool,
    clearErrors: PropTypes.func,
};

export default CreateStrategy;
