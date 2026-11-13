import { styled } from '@mui/material';
import { useNavigate } from 'react-router';
import EditIcon from '@mui/icons-material/Edit';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { formatPayloadSchemaPath } from './payloadSchemaPaths.ts';
import { schemaFields } from './schemaFields.ts';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import {
    StyledMetaDataItem,
    StyledMetaDataItemLabel,
    StyledMetaDataItemValue,
} from '../FeatureOverviewMetaData/FeatureOverviewMetaData.tsx';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledHeader = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
});

const StyledTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(0.5),
}));

const StyledCaptionText = styled('p')(({ theme }) => ({
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
}));

interface IPayloadSchemaRowProps {
    projectId: string;
    featureId: string;
    payloadSchema?: JsonSchemaProperty;
}

export const PayloadSchemaOverview = ({
    projectId,
    featureId,
    payloadSchema,
}: IPayloadSchemaRowProps) => {
    const navigate = useNavigate();
    const { fieldNames, hasAdditionalProperties } = schemaFields(payloadSchema);

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledTitle>Payload</StyledTitle>
                <PermissionButton
                    size='medium'
                    startIcon={<EditIcon />}
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    variant='text'
                    onClick={() =>
                        navigate(formatPayloadSchemaPath(projectId, featureId))
                    }
                >
                    {payloadSchema ? 'Edit schema' : 'Add schema'}
                </PermissionButton>
            </StyledHeader>
            {payloadSchema ? (
                <StyledMetaDataItem>
                    <StyledMetaDataItemLabel>
                        JSON schema:
                    </StyledMetaDataItemLabel>
                    <StyledMetaDataItemValue>
                        {fieldNames.length}
                        {hasAdditionalProperties ? '+' : ''} field
                        {fieldNames.length === 1 && !hasAdditionalProperties
                            ? ''
                            : 's'}
                    </StyledMetaDataItemValue>
                </StyledMetaDataItem>
            ) : (
                <StyledCaptionText>
                    Define the structure of this flag's payload so values are
                    validated before they're saved
                </StyledCaptionText>
            )}
        </StyledContainer>
    );
};
