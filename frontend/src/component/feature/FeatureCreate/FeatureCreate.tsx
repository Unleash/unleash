import { useEffect, useState, FormEvent } from 'react';
import { useHistory, useParams } from 'react-router';
import { useStyles } from './FeatureCreate.styles';
import { IFeatureViewParams } from '../../../interfaces/params';
import PageContent from '../../common/PageContent';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { CardActions } from '@material-ui/core';
import FeatureTypeSelect from '../FeatureView2/FeatureSettings/FeatureSettingsMetadata/FeatureTypeSelect/FeatureTypeSelect';
import {
    CF_CREATE_BTN_ID,
    CF_DESC_ID,
    CF_NAME_ID,
    CF_TYPE_ID,
} from '../../../testIds';
import { getTogglePath } from '../../../utils/route-path-helpers';
import { IFeatureToggleDTO } from '../../../interfaces/featureToggle';
import { useCommonStyles } from '../../../common.styles';
import { FormButtons } from '../../common';
import useQueryParams from '../../../hooks/useQueryParams';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import Input from '../../common/Input/Input';
import ProjectSelect from '../project-select-container';
import { projectFilterGenerator } from '../../../utils/project-filter-generator';
import useUser from '../../../hooks/api/getters/useUser/useUser';
import { trim } from '../../common/util';
import { CREATE_FEATURE } from '../../providers/AccessProvider/permissions';

const FeatureCreate = () => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const { projectId } = useParams<IFeatureViewParams>();
    const params = useQueryParams();
    const { createFeatureToggle, validateFeatureToggleName } = useFeatureApi();
    const history = useHistory();
    const [toggle, setToggle] = useState<IFeatureToggleDTO>({
        name: params.get('name') || '',
        description: '',
        type: 'release',
        stale: false,
        variants: [],
        project: projectId,
        archived: false,
    });

    const [nameError, setNameError] = useState('');
    const { uiConfig } = useUiConfig();
    const { permissions } = useUser();

    useEffect(() => {
        window.onbeforeunload = () =>
            'Data will be lost if you leave the page, are you sure?';

        return () => {
            //@ts-ignore
            window.onbeforeunload = false;
        };
    }, []);

    const onCancel = () => history.push(`/projects/${projectId}`);

    const validateName = async (featureToggleName: string) => {
        if (featureToggleName.length > 0) {
            try {
                await validateFeatureToggleName(featureToggleName);
            } catch (err: any) {
                setNameError(
                    err && err.message ? err.message : 'Could not check name'
                );
            }
        }
    };

    const onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();

        await validateName(toggle.name);

        if(!toggle.name) {
            setNameError('Name is not allowed to be empty');
            return;
        }

        if (nameError) {
            return;
        }

        try {
            await createFeatureToggle(toggle.project, toggle)
            history.push(getTogglePath(toggle.project, toggle.name, uiConfig.flags.E));
            // Trigger
        } catch (err) {
            if(err instanceof Error) {
                if (err.toString().includes('not allowed to be empty')) {
                    setNameError('Name is not allowed to be empty');
                }
            }
        }
    };

    const setValue = (field: string, value: string) => {
        setToggle({ ...toggle, [field]: value });
    };

    return (
        <PageContent
            headerContent="Create feature toggle"
            bodyClass={styles.bodyContainer}
        >
            <form onSubmit={onSubmit}>
                <input type="hidden" name="project" value={projectId} />
                <div className={styles.formContainer}>
                    <Input
                        autoFocus
                        label="Name"
                        placeholder="Unique-name"
                        className={styles.nameInput}
                        name="name"
                        inputProps={{
                            'data-test': CF_NAME_ID,
                        }}
                        value={toggle.name}
                        error={Boolean(nameError)}
                        helperText={nameError}
                        onBlur={v => validateName(v.target.value)}
                        onChange={v => {
                            setValue('name', trim(v.target.value));
                            setNameError('');
                        }}
                    />
                </div>
                <section className={styles.formContainer}>
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
                </section>
                <section className={styles.formContainer}>
                    <ProjectSelect
                        value={toggle.project}
                        onChange={v => setValue('project', v.target.value)}
                        filter={projectFilterGenerator({ permissions }, CREATE_FEATURE)}
                    />
                </section>
                <section className={styles.formContainer}>
                    <Input
                        className={commonStyles.fullWidth}
                        multiline
                        rows={4}
                        label="Description"
                        placeholder="A short description of the feature toggle"
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
