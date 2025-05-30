import { Box, styled } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestPatchVariant,
} from 'component/changeRequest/changeRequest.types';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { EnvironmentVariantsTable } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsCard/EnvironmentVariantsTable/EnvironmentVariantsTable';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import type { ReactNode } from 'react';
import { ChangeOverwriteWarning } from '../ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import { VariantDiff } from './VariantDiff.tsx';

const ChangeItemInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledChangeHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(3),
}));

const StyledStickinessContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
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
    actions?: ReactNode;
    changeRequestState: ChangeRequestState;
}

export const VariantPatch = ({
    feature,
    project,
    environment,
    change,
    actions,
    changeRequestState,
}: IVariantPatchProps) => {
    const { feature: featureData } = useFeature(project, feature);

    const preData =
        featureData.environments.find(({ name }) => environment === name)
            ?.variants ?? [];

    return (
        <ChangeItemInfo>
            <ChangeOverwriteWarning
                data={{
                    current: preData,
                    change,
                    changeType: 'environment variant configuration',
                }}
                changeRequestState={changeRequestState}
            />
            <StyledChangeHeader>
                <TooltipLink
                    tooltip={
                        <VariantDiff
                            preData={preData}
                            data={change.payload.variants}
                        />
                    }
                    tooltipProps={{
                        maxWidth: 500,
                        maxHeight: 600,
                    }}
                >
                    Updating variants to:
                </TooltipLink>
                {actions}
            </StyledChangeHeader>
            <EnvironmentVariantsTable variants={change.payload.variants} />
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
