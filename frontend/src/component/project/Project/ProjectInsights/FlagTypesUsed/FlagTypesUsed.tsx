import { type FC, useMemo } from 'react';
import { styled, type SvgIconTypeMap, Typography } from '@mui/material';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { FeatureTypeCountSchema } from '../../../../../openapi';

export const StyledProjectInfoWidgetContainer = styled('div')(({ theme }) => ({
    margin: '0',
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
}));

export const StyledWidgetTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2.5),
}));

export const StyledCount = styled('span')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.palette.text.primary,
}));

const StyledTypeCount = styled(StyledCount)(({ theme }) => ({
    marginLeft: 'auto',
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.secondary,
}));

interface IFlagTypeRowProps {
    type: string;
    Icon: OverridableComponent<SvgIconTypeMap>;
    count: number;
}

const StyledParagraphGridRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    width: '100%',
    margin: theme.spacing(1, 0),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
        margin: 0,
    },
}));

const FlagTypesRow = ({ type, Icon, count }: IFlagTypeRowProps) => {
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

export const FlagTypesUsed: FC<{
    featureTypeCounts: FeatureTypeCountSchema[];
}> = ({ featureTypeCounts }) => {
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
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle variant='h3' data-loading>
                Flag types used
            </StyledWidgetTitle>
            {Object.keys(featureTypeStats).map((type) => (
                <FlagTypesRow
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
