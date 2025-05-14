import {
    Button,
    FormControl,
    FormControlLabel,
    styled,
    Switch,
    type Theme,
    Typography,
    Link,
    Box,
} from '@mui/material';
import FeatureTypeSelect from '../FeatureView/FeatureSettings/FeatureSettingsMetadata/FeatureTypeSelect/FeatureTypeSelect.tsx';
import { CF_DESC_ID, CF_TYPE_ID } from 'utils/testIds';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import Input from 'component/common/Input/Input';
import type React from 'react';
import type { CreateFeatureSchemaType } from 'openapi';

interface IFeatureToggleForm {
    type: CreateFeatureSchemaType;
    name: string;
    description: string;
    impressionData: boolean;
    setType: React.Dispatch<React.SetStateAction<CreateFeatureSchemaType>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setImpressionData: React.Dispatch<React.SetStateAction<boolean>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    children?: React.ReactNode;
    Limit?: React.ReactNode;
}

const StyledForm = styled('form')({
    height: '100%',
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

const LimitContainer = styled(Box)(({ theme }) => ({
    '&:has(*)': {
        marginBottom: theme.spacing(2),
    },
}));

const EditFeatureForm: React.FC<IFeatureToggleForm> = ({
    children,
    type,
    name,
    description,
    setType,
    setDescription,
    setImpressionData,
    impressionData,
    handleSubmit,
    handleCancel,
    Limit,
}) => {
    const { featureTypes } = useFeatureTypes();

    const renderToggleDescription = () => {
        return featureTypes.find((flag) => flag.id === type)?.description;
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <StyledInputDescription>
                What would you like to call your flag?
            </StyledInputDescription>
            <StyledInput
                autoFocus
                disabled={true}
                label='Name'
                id='feature-flag-name'
                value={name}
                onChange={() => {}}
            />
            <StyledInputDescription>
                What kind of feature flag do you want?
            </StyledInputDescription>
            <FeatureTypeSelect
                sx={styledSelectInput}
                value={type}
                onChange={setType}
                label={'Flag type'}
                id='feature-type-select'
                editable
                data-testid={CF_TYPE_ID}
                IconComponent={KeyboardArrowDownOutlined}
            />
            <StyledTypeDescription>
                {renderToggleDescription()}
            </StyledTypeDescription>
            <StyledInputDescription>
                How would you describe your feature flag?
            </StyledInputDescription>
            <StyledInput
                multiline
                rows={4}
                label='Description'
                placeholder='A short description of the feature flag'
                value={description}
                data-testid={CF_DESC_ID}
                onChange={(e) => setDescription(e.target.value)}
            />
            <StyledFormControl>
                <Typography
                    variant='subtitle1'
                    sx={styledTypography}
                    data-loading
                    component='h2'
                >
                    Impression Data
                </Typography>
                <p>
                    When you enable impression data for a feature flag, your
                    client SDKs will emit events you can listen for every time
                    this flag gets triggered. Learn more in{' '}
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://docs.getunleash.io/advanced/impression_data'
                    >
                        the impression data documentation
                    </Link>
                </p>
                <StyledRow>
                    <FormControlLabel
                        labelPlacement='start'
                        style={{ marginLeft: 0 }}
                        control={
                            <Switch
                                name='impressionData'
                                onChange={() =>
                                    setImpressionData(!impressionData)
                                }
                                checked={impressionData}
                            />
                        }
                        label='Enable impression data'
                    />
                </StyledRow>
            </StyledFormControl>
            <LimitContainer>{Limit}</LimitContainer>
            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};

export default EditFeatureForm;
