import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardActions, Switch, TextField } from '@material-ui/core';
import FeatureTypeSelect from '../../feature-type-select-container';
import ProjectSelect from '../../project-select-container';
import StrategiesList from '../../strategy/strategies-list-container';
import PageContent from '../../../common/PageContent/PageContent';

import { FormButtons, styles as commonStyles } from '../../../common';
import { trim } from '../../../common/util';

import styles from '../add-feature-component.module.scss';
import {
    CF_CREATE_BTN_ID,
    CF_DESC_ID,
    CF_NAME_ID,
    CF_TYPE_ID,
} from '../../../../testIds';
import { CREATE_FEATURE } from '../../../AccessProvider/permissions';
import { projectFilterGenerator } from '../../../../utils/project-filter-generator';

const CreateFeature = ({
    input,
    errors,
    setValue,
    validateName,
    onSubmit,
    onCancel,
    user,
}) => {
    useEffect(() => {
        window.onbeforeunload = () =>
            'Data will be lost if you leave the page, are you sure?';

        return () => {
            window.onbeforeunload = false;
        };
    }, []);

    return (
        <PageContent headerContent="Create new feature toggle">
            <form onSubmit={onSubmit}>
                <div className={styles.formContainer}>
                    <TextField
                        size="small"
                        variant="outlined"
                        label="Name"
                        required
                        placeholder="Unique-name"
                        className={styles.nameInput}
                        name="name"
                        inputProps={{
                            'data-test': CF_NAME_ID,
                        }}
                        value={input.name}
                        error={errors.name !== undefined}
                        helperText={errors.name}
                        onBlur={v => validateName(v.target.value)}
                        onChange={v => setValue('name', trim(v.target.value))}
                    />
                </div>
                <div className={styles.formContainer}>
                    <FeatureTypeSelect
                        value={input.type}
                        onChange={v => setValue('type', v.target.value)}
                        label={'Toggle type'}
                        id="feature-type-select"
                        editable
                        inputProps={{
                            'data-test': CF_TYPE_ID,
                        }}
                    />
                </div>
                <section className={styles.formContainer}>
                    <ProjectSelect
                        value={input.project}
                        onChange={v => setValue('project', v.target.value)}
                        filter={projectFilterGenerator(user, CREATE_FEATURE)}
                    />
                </section>
                <section className={styles.formContainer}>
                    <TextField
                        size="small"
                        variant="outlined"
                        className={commonStyles.fullwidth}
                        multiline
                        rows={4}
                        label="Description"
                        placeholder="A short description of the feature toggle"
                        error={errors.description !== undefined}
                        helperText={errors.description}
                        value={input.description}
                        inputProps={{
                            'data-test': CF_DESC_ID,
                        }}
                        onChange={v => setValue('description', v.target.value)}
                    />
                </section>
                <section className={styles.toggleContainer}>
                    <Switch
                        checked={input.enabled}
                        onChange={() => {
                            setValue('enabled', !input.enabled);
                        }}
                    />
                    <p className={styles.toggleText}>
                        {input.enabled ? 'Enabled' : 'Disabled'} feature toggle
                    </p>
                </section>
                <section className={styles.strategiesContainer}>
                    <StrategiesList
                        configuredStrategies={input.strategies}
                        featureToggleName={input.name}
                        saveStrategies={s => setValue('strategies', s)}
                        editable
                    />
                </section>
                <CardActions>
                    <FormButtons
                        submitText={'Create'}
                        primaryButtonTestId={CF_CREATE_BTN_ID}
                        onCancel={onCancel}
                    />
                </CardActions>
            </form>
        </PageContent>
    );
};

CreateFeature.propTypes = {
    input: PropTypes.object,
    errors: PropTypes.object,
    setValue: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    validateName: PropTypes.func.isRequired,
    initCallRequired: PropTypes.bool,
    init: PropTypes.func,
};

export default CreateFeature;
