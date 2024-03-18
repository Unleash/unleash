import type { VFC } from 'react';
import { styled, Tooltip } from '@mui/material';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';

interface IFeatureTypeProps {
    value?: string;
    getValue?: () => string | undefined | null;
}

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.disabled,
}));

// `getValue is for new @tanstack/react-table (v8), `value` is for legacy react-table (v7)
export const FeatureTypeCell: VFC<IFeatureTypeProps> = ({
    value,
    getValue,
}) => {
    const type = value || getValue?.() || undefined;
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);

    const typeName = featureTypes.find(
        (featureType) => featureType.id === type,
    )?.name;

    const title = `This is a "${typeName || type}" toggle`;

    return (
        <StyledContainer>
            <Tooltip arrow title={title} describeChild>
                <IconComponent data-loading />
            </Tooltip>
        </StyledContainer>
    );
};
