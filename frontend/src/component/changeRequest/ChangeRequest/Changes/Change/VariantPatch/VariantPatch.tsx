import { Box, styled, Typography } from '@mui/material';
import { IChangeRequestPatchVariant } from 'component/changeRequest/changeRequest.types';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ReactNode } from 'react';
import { Diff } from './Diff';

export const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const ChangeItemInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

interface IVariantPatchProps {
    feature: string;
    project: string;
    environment: string;
    change: IChangeRequestPatchVariant;
    discard?: ReactNode;
}

export const VariantPatch = ({
    feature,
    project,
    environment,
    change,
    discard,
}: IVariantPatchProps) => {
    const { feature: featureData } = useFeature(project, feature);

    const preData = featureData.environments.find(
        ({ name }) => environment === name
    )?.variants;

    return (
        <ChangeItemCreateEditWrapper>
            <ChangeItemInfo>
                <Typography>Updating variants:</Typography>
                <Diff preData={preData} data={change.payload.variants} />
            </ChangeItemInfo>
            {discard}
        </ChangeItemCreateEditWrapper>
    );
};
