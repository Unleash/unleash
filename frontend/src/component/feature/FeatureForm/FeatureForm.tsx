import {
    Button,
    FormControl,
    FormControlLabel,
    Switch,
    Typography,
} from '@mui/material';
import { useStyles } from './FeatureForm.styles';
import FeatureTypeSelect from '../FeatureView/FeatureSettings/FeatureSettingsMetadata/FeatureTypeSelect/FeatureTypeSelect';
import { CF_DESC_ID, CF_NAME_ID, CF_TYPE_ID } from 'utils/testIds';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import { projectFilterGenerator } from 'utils/projectFilterGenerator';
import FeatureProjectSelect from '../FeatureView/FeatureSettings/FeatureSettingsProject/FeatureProjectSelect/FeatureProjectSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { trim } from 'component/common/util';
import Input from 'component/common/Input/Input';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';

interface IFeatureToggleForm {
    type: string;
    name: string;
    description: string;
    project: string;
    impressionData: boolean;
    setType: React.Dispatch<React.SetStateAction<string>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProject: React.Dispatch<React.SetStateAction<string>>;
    setImpressionData: React.Dispatch<React.SetStateAction<boolean>>;
    validateToggleName?: () => void;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
}

const FeatureForm: React.FC<IFeatureToggleForm> = ({
    children,
    type,
    name,
    description,
    project,
    setType,
    setName,
    setDescription,
    setProject,
    validateToggleName,
    setImpressionData,
    impressionData,
    handleSubmit,
    handleCancel,
    errors,
    mode,
    clearErrors,
}) => {
    const { classes: styles } = useStyles();
    const { featureTypes } = useFeatureTypes();
    const navigate = useNavigate();
    const { permissions } = useAuthPermissions();
    const editable = mode !== 'Edit';

    const renderToggleDescription = () => {
        return featureTypes.find(toggle => toggle.id === type)?.description;
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What would you like to call your toggle?
                </p>
                <Input
                    autoFocus
                    disabled={mode === 'Edit'}
                    className={styles.input}
                    label="Name"
                    id="feature-toggle-name"
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    value={name}
                    onChange={e => setName(trim(e.target.value))}
                    data-testid={CF_NAME_ID}
                    onBlur={validateToggleName}
                />
                <p className={styles.inputDescription}>
                    What kind of feature toggle do you want?
                </p>
                <FeatureTypeSelect
                    value={type}
                    onChange={setType}
                    label={'Toggle type'}
                    id="feature-type-select"
                    editable
                    data-testid={CF_TYPE_ID}
                    IconComponent={KeyboardArrowDownOutlined}
                    className={styles.selectInput}
                />
                <p className={styles.typeDescription}>
                    {renderToggleDescription()}
                </p>
                <ConditionallyRender
                    condition={editable}
                    show={
                        <p className={styles.inputDescription}>
                            In which project do you want to save the toggle?
                        </p>
                    }
                />
                <FeatureProjectSelect
                    value={project}
                    onChange={projectId => {
                        setProject(projectId);
                        navigate(`/projects/${projectId}/create-toggle`, {
                            replace: true,
                        });
                    }}
                    enabled={editable}
                    filter={projectFilterGenerator(permissions, CREATE_FEATURE)}
                    IconComponent={KeyboardArrowDownOutlined}
                    className={styles.selectInput}
                />

                <p className={styles.inputDescription}>
                    How would you describe your feature toggle?
                </p>
                <Input
                    className={styles.input}
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="A short description of the feature toggle"
                    value={description}
                    data-testid={CF_DESC_ID}
                    onChange={e => setDescription(e.target.value)}
                />
                <FormControl className={styles.input}>
                    <Typography
                        variant="subtitle1"
                        className={styles.roleSubtitle}
                        data-loading
                        component="h2"
                    >
                        Impression Data
                    </Typography>
                    <p>
                        When you enable impression data for a feature toggle,
                        your client SDKs will emit events you can listen for
                        every time this toggle gets triggered. Learn more in{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.getunleash.io/advanced/impression_data"
                        >
                            the impression data documentation
                        </a>
                    </p>
                    <div className={styles.flexRow}>
                        <FormControlLabel
                            labelPlacement="start"
                            style={{ marginLeft: 0 }}
                            control={
                                <Switch
                                    name="impressionData"
                                    onChange={() =>
                                        setImpressionData(!impressionData)
                                    }
                                    checked={impressionData}
                                />
                            }
                            label="Enable impression data"
                        />
                    </div>
                </FormControl>
            </div>

            <div className={styles.buttonContainer}>
                {children}
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default FeatureForm;
