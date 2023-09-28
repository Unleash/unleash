import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { AddDependencyDialogue } from 'component/feature/Dependencies/AddDependencyDialogue';
import { useUiFlag } from 'hooks/useUiFlag';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { FC, useState } from 'react';
import { FlexRow, StyledDetail, StyledLabel, StyledLink } from './StyledRow';

export const DependencyRow: FC<{ feature: IFeatureToggle }> = ({ feature }) => {
    const dependentFeatures = useUiFlag('dependentFeatures');
    const [showDependencyDialogue, setShowDependencyDialogue] = useState(false);

    return (
        <>
            <ConditionallyRender
                condition={
                    dependentFeatures &&
                    Boolean(feature.project) &&
                    feature.dependencies.length === 0 &&
                    feature.children.length === 0
                }
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
                condition={
                    dependentFeatures &&
                    Boolean(feature.project) &&
                    Boolean(feature.dependencies.length > 0)
                }
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
                    </FlexRow>
                }
            />
            <ConditionallyRender
                condition={
                    dependentFeatures &&
                    Boolean(feature.project) &&
                    feature.children.length > 0
                }
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
                condition={dependentFeatures && Boolean(feature.project)}
                show={
                    <AddDependencyDialogue
                        project={feature.project}
                        featureId={feature.name}
                        onClose={() => setShowDependencyDialogue(false)}
                        showDependencyDialogue={
                            dependentFeatures && showDependencyDialogue
                        }
                    />
                }
            />
        </>
    );
};
