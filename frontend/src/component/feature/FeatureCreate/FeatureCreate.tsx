import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useStyles } from './FeatureCreate.styles';
import { IFeatureViewParams } from '../../../interfaces/params';
import PageContent from '../../common/PageContent';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { CardActions, TextField } from '@material-ui/core';
import FeatureTypeSelect from '../FeatureView2/FeatureSettings/FeatureSettingsMetadata/FeatureTypeSelect/FeatureTypeSelect';
import {
    CF_CREATE_BTN_ID,
    CF_DESC_ID,
    CF_NAME_ID,
    CF_TYPE_ID,
} from '../../../testIds';
import { loadNameFromUrl, trim } from '../../common/util';
import { getTogglePath } from '../../../utils/route-path-helpers';
import { IFeatureToggleDTO } from '../../../interfaces/featureToggle';
import { FormEventHandler } from 'react-router/node_modules/@types/react';
import { useCommonStyles } from '../../../common.styles';
import { FormButtons } from '../../common';

interface Errors {
    name?: string;
    description?: string;
}

const FeatureCreate = () => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const { projectId } = useParams<IFeatureViewParams>();
    const { createFeatureToggle, validateFeatureToggleName } = useFeatureApi();
    const history = useHistory();
    const [ toggle, setToggle ] = useState<IFeatureToggleDTO>({
        name: loadNameFromUrl(),
        description: '',
        type: 'release',
        stale: false,
        variants: [],
        project: projectId,
        archived: false,
    });
    const [errors, setErrors] = useState<Errors>({});


    useEffect(() => {
        window.onbeforeunload = () =>
            'Data will be lost if you leave the page, are you sure?';

        return () => {
            //@ts-ignore
            window.onbeforeunload = false;
        };
    }, []);

    const onCancel = () => history.push(
        `/projects/${projectId}`
    );


    const validateName = async (featureToggleName: string) => {
        const e = { ...errors };
        try {
            await validateFeatureToggleName(featureToggleName);
            e.name = undefined;
        } catch (err: any) {
            e.name = err && err.message ? err.message : 'Could not check name';
        }

        setErrors(e);
    };

    const onSubmit = async (evt: FormEventHandler) => {
        evt.preventDefault();

        const errorList = Object.values(errors).filter(i => i);

        if (errorList.length > 0) {
            return;
        }

        try {
            await createFeatureToggle(projectId, toggle).then(() =>
                history.push(
                    getTogglePath(toggle.project, toggle.name, true)
                )
            );
            // Trigger
        } catch (e: any) {
            if (e.toString().includes('not allowed to be empty')) {
                setErrors({ name: 'Name is not allowed to be empty' })
            }
        }
    };

    const setValue = (field:string, value:string) => {
        setToggle({...toggle, [field]: value})
    }


    return (
        <PageContent headerContent="Create feature toggle" bodyClass={styles.bodyContainer}>
            <form onSubmit={onSubmit}>
                <input type="hidden" name="project" value={projectId} />
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
                        value={toggle.name}
                        error={errors.name !== undefined}
                        helperText={errors.name}
                        onBlur={v => validateName(v.target.value)}
                        onChange={v => setValue('name', trim(v.target.value))}
                    />
                </div>
                <div className={styles.formContainer}>
                    <FeatureTypeSelect
                        value={toggle.type}
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
                    <TextField
                        size="small"
                        variant="outlined"
                        className={commonStyles.fullWidth}
                        multiline
                        rows={4}
                        label="Description"
                        placeholder="A short description of the feature toggle"
                        error={errors.description !== undefined}
                        helperText={errors.description}
                        value={toggle.description}
                        inputProps={{
                            'data-test': CF_DESC_ID,
                        }}
                        onChange={v => setValue('description', v.target.value)}
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

export default FeatureCreate;
