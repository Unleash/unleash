import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { AddDependencyDialogue } from 'component/feature/Dependencies/AddDependencyDialogue';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { FC, useState } from 'react';
import { FlexRow, StyledDetail, StyledLabel, StyledLink } from './StyledRow';
import { DependencyActions } from './DependencyActions';
import { useDependentFeaturesApi } from 'hooks/api/actions/useDependentFeaturesApi/useDependentFeaturesApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

export const DependencyRow: FC<{ feature: IFeatureToggle }> = ({ feature }) => {
    const { removeDependencies } = useDependentFeaturesApi(feature.project);
    const { refetchFeature } = useFeature(feature.project, feature.name);
    const [showDependencyDialogue, setShowDependencyDialogue] = useState(false);
    const canAddParentDependency =
        Boolean(feature.project) &&
        feature.dependencies.length === 0 &&
        feature.children.length === 0;
    const hasParentDependency =
        Boolean(feature.project) && Boolean(feature.dependencies.length > 0);
    const hasChildren = Boolean(feature.project) && feature.children.length > 0;

    return (
        <>
            <ConditionallyRender
                condition={canAddParentDependency}
                show={
                    <FlexRow>
                        <StyledDetail>
                            <StyledLabel>Dependency:</StyledLabel>
                            <Button
                                startIcon={<Add />}
                                onClick={() => {
                                    setShowDependencyDialogue(true);
                                }}
                            >
                                Add parent feature
                            </Button>
                        </StyledDetail>
                    </FlexRow>
                }
            />
            <ConditionallyRender
                condition={hasParentDependency}
                show={
                    <FlexRow>
                        <StyledDetail>
                            <StyledLabel>Dependency:</StyledLabel>
                            <StyledLink
                                to={`/projects/${feature.project}/features/${feature.dependencies[0]?.feature}`}
                            >
                                {feature.dependencies[0]?.feature}
                            </StyledLink>
                        </StyledDetail>
                        <DependencyActions
                            feature={feature.name}
                            onEdit={() => setShowDependencyDialogue(true)}
                            onDelete={async () => {
                                await removeDependencies(feature.name);
                                await refetchFeature();
                            }}
                        />
                    </FlexRow>
                }
            />
            <ConditionallyRender
                condition={hasChildren}
                show={
                    <FlexRow>
                        <StyledDetail>
                            <StyledLabel>Children:</StyledLabel>
                            <TooltipLink
                                tooltip={
                                    <>
                                        {feature.children.map(child => (
                                            <StyledLink
                                                to={`/projects/${feature.project}/features/${child}`}
                                            >
                                                <div>{child}</div>
                                            </StyledLink>
                                        ))}
                                    </>
                                }
                            >
                                {feature.children.length === 1
                                    ? '1 feature'
                                    : `${feature.children.length} features`}
                            </TooltipLink>
                        </StyledDetail>
                    </FlexRow>
                }
            />
            <ConditionallyRender
                condition={Boolean(feature.project)}
                show={
                    <AddDependencyDialogue
                        project={feature.project}
                        featureId={feature.name}
                        onClose={() => setShowDependencyDialogue(false)}
                        showDependencyDialogue={showDependencyDialogue}
                    />
                }
            />
        </>
    );
};
