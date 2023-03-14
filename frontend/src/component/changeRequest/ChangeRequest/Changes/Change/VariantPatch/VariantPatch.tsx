import { Box, styled } from '@mui/material';
import { IChangeRequestPatchVariant } from 'component/changeRequest/changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ReactNode } from 'react';
import { Diff } from './Diff';

const ChangeItemInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledChangeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    lineHeight: theme.spacing(3),
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
    margin: theme.spacing(2, 0),
}));

const StyledStickinessContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(-0.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
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
        <ChangeItemInfo>
            <StyledChangeHeader>
                <TooltipLink
                    tooltip={
                        <Diff
                            preData={preData}
                            data={change.payload.variants}
                        />
                    }
                >
                    Updating variants:
                </TooltipLink>
                {discard}
            </StyledChangeHeader>
            <StyledTableContainer>
                <EnvironmentVariantsTable variants={change.payload.variants} />
            </StyledTableContainer>
            <ConditionallyRender
                condition={change.payload.variants.length > 1}
                show={
                    <>
                        <StyledStickinessContainer>
                            <p>Stickiness:</p>
                            <Badge>
                                {change.payload.variants[0]?.stickiness ||
                                    'default'}
                            </Badge>
                        </StyledStickinessContainer>
                    </>
                }
            />
        </ChangeItemInfo>
    );
};
