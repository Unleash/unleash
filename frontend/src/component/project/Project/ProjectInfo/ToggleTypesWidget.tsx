import { useMemo } from 'react';
import { styled } from '@mui/material';
import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import {
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledParagraphGridRow,
    StyledWidgetTitle,
} from './ProjectInfo.styles';

export interface IToggleTypesWidgetProps {
    features: IFeatureToggleListItem[];
}

const StyledTypeCount = styled(StyledCount)(() => ({
    marginLeft: 'auto',
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
                <ReleaseToggleIcon fontSize="small" data-loading />
                <div>Release</div>
                <StyledTypeCount>{release}</StyledTypeCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <ExperimentToggleIcon fontSize="small" data-loading />
                <div>Experiment</div>
                <StyledTypeCount>{experiment}</StyledTypeCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <OperationalToggleIcon fontSize="small" data-loading />
                <div>Operational</div>
                <StyledTypeCount>{operational}</StyledTypeCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading>
                <KillToggleIcon fontSize="small" data-loading />
                <div>Kill switch</div>
                <StyledTypeCount>{kill}</StyledTypeCount>
            </StyledParagraphGridRow>
            <StyledParagraphGridRow data-loading style={{ margin: 0 }}>
                <PermissionToggleIcon fontSize="small" data-loading />
                <div>Permission</div>
                <StyledTypeCount>{permission}</StyledTypeCount>
            </StyledParagraphGridRow>
        </StyledProjectInfoWidgetContainer>
    );
};
