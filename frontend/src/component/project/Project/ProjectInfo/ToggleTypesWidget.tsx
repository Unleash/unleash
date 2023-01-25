import { useMemo } from 'react';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import {
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledParagraphGridRow,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { styled } from '@mui/material';

export interface IToggleTypesWidgetProps {
    features: IFeatureToggleListItem[];
}

const StyledIconContainer = styled('div')(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
}));

export const ToggleTypesWidget = ({ features }: IToggleTypesWidgetProps) => {
    const { release, experiment, operational, kill, permission } =
        useMemo(() => {
            const release =
                features?.filter(feature => feature.type === 'release')
                    .length || 0;
            const experiment =
                features?.filter(feature => feature.type === 'experiment')
                    .length || 0;
            const operational =
                features?.filter(feature => feature.type === 'operational')
                    .length || 0;
            const kill =
                features?.filter(feature => feature.type === 'kill-switch')
                    .length || 0;
            const permission =
                features?.filter(feature => feature.type === 'permission')
                    .length || 0;

            return {
                release,
                experiment,
                operational,
                kill,
                permission,
            };
        }, [features]);

    const ReleaseToggleIcon = getFeatureTypeIcons('release');
    const ExperimentToggleIcon = getFeatureTypeIcons('experiment');
    const OperationalToggleIcon = getFeatureTypeIcons('operational');
    const KillToggleIcon = getFeatureTypeIcons('kill-switch');
    const PermissionToggleIcon = getFeatureTypeIcons('permission');

    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle data-loading>
                Toggle types used
            </StyledWidgetTitle>
            <StyledParagraphGridRow data-loading>
                <StyledIconContainer>
                    <ReleaseToggleIcon fontSize="inherit" data-loading />
                </StyledIconContainer>
                <div>Release</div>
                <StyledCount>{release}</StyledCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <StyledIconContainer>
                    <ExperimentToggleIcon fontSize="inherit" data-loading />
                </StyledIconContainer>
                <div>Experiment</div>
                <StyledCount>{experiment}</StyledCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <StyledIconContainer>
                    <OperationalToggleIcon fontSize="inherit" data-loading />
                </StyledIconContainer>
                <div>Operational</div>
                <StyledCount>{operational}</StyledCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <StyledIconContainer>
                    <KillToggleIcon fontSize="inherit" data-loading />
                </StyledIconContainer>
                <div>Kill switch</div>
                <StyledCount>{kill}</StyledCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <StyledIconContainer>
                    <PermissionToggleIcon fontSize="inherit" data-loading />
                </StyledIconContainer>
                <div>Permission</div>
                <StyledCount>{permission}</StyledCount>
            </StyledParagraphGridRow>
        </StyledProjectInfoWidgetContainer>
    );
};
