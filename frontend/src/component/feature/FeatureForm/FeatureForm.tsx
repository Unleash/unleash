import {
    Button,
    FormControl,
    FormControlLabel,
    styled,
    Switch,
    Theme,
    Typography,
    Link,
} from '@mui/material';
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

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledContainer = styled('div')({
    maxWidth: '400px',
});

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const styledSelectInput = (theme: Theme) => ({
    marginBottom: theme.spacing(2),
    minWidth: '400px',
    [theme.breakpoints.down('sm')]: {
        minWidth: '379px',
    },
});

const StyledTypeDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    top: '-13px',
    position: 'relative',
}));

const StyledButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const styledTypography = (theme: Theme) => ({
    margin: theme.spacing(1, 0),
});

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
    const { featureTypes } = useFeatureTypes();
    const navigate = useNavigate();
    const { permissions } = useAuthPermissions();
    const editable = mode !== 'Edit';

    const renderToggleDescription = () => {
        return featureTypes.find(toggle => toggle.id === type)?.description;
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledContainer>
                <StyledInputDescription>
                    What would you like to call your toggle?
                </StyledInputDescription>
                <StyledInput
                    autoFocus
                    disabled={mode === 'Edit'}
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
                <StyledInputDescription>
                    What kind of feature toggle do you want?
                </StyledInputDescription>
                <FeatureTypeSelect
                    sx={styledSelectInput}
                    value={type}
                    onChange={setType}
                    label={'Toggle type'}
                    id="feature-type-select"
                    editable
                    data-testid={CF_TYPE_ID}
                    IconComponent={KeyboardArrowDownOutlined}
                />
                <StyledTypeDescription>
                    {renderToggleDescription()}
                </StyledTypeDescription>
                <ConditionallyRender
                    condition={editable}
                    show={
                        <StyledInputDescription>
                            In which project do you want to save the toggle?
                        </StyledInputDescription>
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
                    sx={styledSelectInput}
                />

                <StyledInputDescription>
                    How would you describe your feature toggle?
                </StyledInputDescription>
                <StyledInput
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="A short description of the feature toggle"
                    value={description}
                    data-testid={CF_DESC_ID}
                    onChange={e => setDescription(e.target.value)}
                />
                <StyledFormControl>
                    <Typography
                        variant="subtitle1"
                        sx={styledTypography}
                        data-loading
                        component="h2"
                    >
                        Impression Data
                    </Typography>
                    <p>
                        When you enable impression data for a feature toggle,
                        your client SDKs will emit events you can listen for
                        every time this toggle gets triggered. Learn more in{' '}
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.getunleash.io/advanced/impression_data"
                        >
                            the impression data documentation
                        </Link>
                    </p>
                    <StyledRow>
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
                    </StyledRow>
                </StyledFormControl>
            </StyledContainer>

            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};

export default FeatureForm;
