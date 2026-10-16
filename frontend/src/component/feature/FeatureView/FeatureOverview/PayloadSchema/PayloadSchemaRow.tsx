import { styled } from '@mui/material';
import { useNavigate } from 'react-router';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import {
    StyledMetaDataItem,
    StyledMetaDataItemLabel,
    StyledMetaDataItemValue,
} from '../FeatureOverviewMetaData/FeatureOverviewMetaData.tsx';
import { formatPayloadSchemaPath } from './payloadSchemaPaths.ts';

const StyledPermissionButton = styled(PermissionButton)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: theme.typography.body1.lineHeight,
}));

interface IPayloadSchemaRowProps {
    projectId: string;
    featureId: string;
}

export const PayloadSchemaRow = ({
    projectId,
    featureId,
}: IPayloadSchemaRowProps) => {
    const navigate = useNavigate();

    return (
        <StyledMetaDataItem>
            <StyledMetaDataItemLabel>Payload schema:</StyledMetaDataItemLabel>
            <StyledMetaDataItemValue>
                <StyledPermissionButton
                    size='medium'
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    variant='text'
                    onClick={() =>
                        navigate(formatPayloadSchemaPath(projectId, featureId))
                    }
                >
                    Edit schema
                </StyledPermissionButton>
            </StyledMetaDataItemValue>
        </StyledMetaDataItem>
    );
};
