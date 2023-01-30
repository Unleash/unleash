import { useMemo } from 'react';
import { styled, SvgIconTypeMap } from '@mui/material';
import type { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import {
    StyledCount,
    StyledParagraphGridRow,
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export interface IToggleTypesWidgetProps {
    features: IFeatureToggleListItem[];
}

const StyledTypeCount = styled(StyledCount)(() => ({
    marginLeft: 'auto',
}));

interface IToggleTypeRowProps {
    type: string;
    Icon: OverridableComponent<SvgIconTypeMap>;
    count: number;
}
const ToggleTypesRow = ({ type, Icon, count }: IToggleTypeRowProps) => {
    const getTitleText = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
    };
    return (
        <StyledParagraphGridRow data-loading>
            <Icon fontSize="small" data-loading />
            <div>{getTitleText(type)}</div>
            <StyledTypeCount>{count}</StyledTypeCount>
        </StyledParagraphGridRow>
    );
};

export const ToggleTypesWidget = ({ features }: IToggleTypesWidgetProps) => {
    const featureTypeStats = useMemo(() => {
        const release =
            features?.filter(feature => feature.type === 'release').length || 0;
        const experiment =
            features?.filter(feature => feature.type === 'experiment').length ||
            0;
        const operational =
            features?.filter(feature => feature.type === 'operational')
                .length || 0;
        const kill =
            features?.filter(feature => feature.type === 'kill-switch')
                .length || 0;
        const permission =
            features?.filter(feature => feature.type === 'permission').length ||
            0;

        return {
            release,
            experiment,
            operational,
            'kill-switch': kill,
            permission,
        };
    }, [features]);

    return (
        <StyledProjectInfoWidgetContainer
            sx={{ padding: theme => theme.spacing(3) }}
        >
            <StyledWidgetTitle data-loading>
                Toggle types used
            </StyledWidgetTitle>
            {Object.keys(featureTypeStats).map(type => (
                <ToggleTypesRow
                    type={type}
                    Icon={getFeatureTypeIcons(type)}
                    count={
                        featureTypeStats[type as keyof typeof featureTypeStats]
                    }
                />
            ))}
        </StyledProjectInfoWidgetContainer>
    );
};
