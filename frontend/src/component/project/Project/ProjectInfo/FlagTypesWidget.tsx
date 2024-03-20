import { useMemo } from 'react';
import { styled, type SvgIconTypeMap } from '@mui/material';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import {
    StyledCount,
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { FeatureTypeCount } from 'interfaces/project';

export interface IFlagTypesWidgetProps {
    featureTypeCounts: FeatureTypeCount[];
}

const StyledTypeCount = styled(StyledCount)(({ theme }) => ({
    marginLeft: 'auto',
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.secondary,
}));

interface IToggleTypeRowProps {
    type: string;
    Icon: OverridableComponent<SvgIconTypeMap>;
    count: number;
}

const StyledParagraphGridRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    width: '100%',
    gridTemplateColumns: `${theme.spacing(2.5)} auto auto`, //20px auto auto
    margin: theme.spacing(1, 0),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
        margin: 0,
    },
}));

const ToggleTypesRow = ({ type, Icon, count }: IToggleTypeRowProps) => {
    const getTitleText = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
    };

    return (
        <StyledParagraphGridRow data-loading>
            <Icon fontSize='small' data-loading />
            <div>{getTitleText(type)}</div>
            <StyledTypeCount>{count}</StyledTypeCount>
        </StyledParagraphGridRow>
    );
};
/**
 * @Deprecated in favor of FlagTypesUsed.tsx
 */
export const FlagTypesWidget = ({
    featureTypeCounts,
}: IFlagTypesWidgetProps) => {
    const featureTypeStats = useMemo(() => {
        const release =
            featureTypeCounts.find(
                (featureType) => featureType.type === 'release',
            )?.count || 0;

        const experiment =
            featureTypeCounts.find(
                (featureType) => featureType.type === 'experiment',
            )?.count || 0;

        const operational =
            featureTypeCounts.find(
                (featureType) => featureType.type === 'operational',
            )?.count || 0;

        const kill =
            featureTypeCounts.find(
                (featureType) => featureType.type === 'kill-switch',
            )?.count || 0;

        const permission =
            featureTypeCounts.find(
                (featureType) => featureType.type === 'permission',
            )?.count || 0;

        return {
            release,
            experiment,
            operational,
            'kill-switch': kill,
            permission,
        };
    }, [featureTypeCounts]);

    return (
        <StyledProjectInfoWidgetContainer
            sx={{ padding: (theme) => theme.spacing(3) }}
        >
            <StyledWidgetTitle data-loading>
                Toggle types used
            </StyledWidgetTitle>
            {Object.keys(featureTypeStats).map((type) => (
                <ToggleTypesRow
                    type={type}
                    key={type}
                    Icon={getFeatureTypeIcons(type)}
                    count={
                        featureTypeStats[type as keyof typeof featureTypeStats]
                    }
                />
            ))}
        </StyledProjectInfoWidgetContainer>
    );
};
