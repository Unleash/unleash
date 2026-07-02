import {
    Button,
    Switch,
    styled,
    FormControlLabel,
    Link,
    Box,
} from '@mui/material';
import FeatureTypeSelect from '../FeatureView/FeatureSettings/FeatureSettingsMetadata/FeatureTypeSelect/FeatureTypeSelect.tsx';
import { CF_DESC_ID, CF_TYPE_ID } from 'utils/testIds';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
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

// The selected type's own description, tucked under the type select.
const StyledTypeDescription = styled('p')(({ theme }) => ({
    margin: theme.spacing(-1, 0, 2, 0),
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
});

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

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
            <FormField
                label='Name'
                description='What would you like to call your flag?'
            >
                <Input
                    fullWidth
                    autoFocus
                    disabled={true}
                    label=''
                    value={name}
                    onChange={() => {}}
                />
            </FormField>
            <FormField
                label='Flag type'
                description='What kind of feature flag do you want?'
            >
                <FeatureTypeSelect
                    fullWidth
                    label=''
                    value={type}
                    onChange={setType}
                    editable
                    data-testid={CF_TYPE_ID}
                    IconComponent={KeyboardArrowDownOutlined}
                />
            </FormField>
            {renderToggleDescription() ? (
                <StyledTypeDescription>
                    {renderToggleDescription()}
                </StyledTypeDescription>
            ) : null}
            <FormField
                label='Description'
                description='How would you describe your feature flag?'
            >
                <Input
                    fullWidth
                    multiline
                    rows={4}
                    label=''
                    placeholder='A short description of the feature flag'
                    value={description}
                    data-testid={CF_DESC_ID}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </FormField>
            <FormField
                label='Impression data'
                description={
                    <>
                        When you enable impression data for a feature flag, your
                        client SDKs will emit events you can listen for every
                        time this flag gets triggered. Learn more in{' '}
                        <Link
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://docs.getunleash.io/concepts/impression-data'
                        >
                            the impression data documentation
                        </Link>
                    </>
                }
            >
                <FormControlLabel
                    label='Enable impression data'
                    control={
                        <Switch
                            name='impressionData'
                            onChange={() => setImpressionData(!impressionData)}
                            checked={impressionData}
                        />
                    }
                />
            </FormField>
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
