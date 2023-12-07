import { VFC } from 'react';
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

export const FeatureTypeCell: VFC<IFeatureTypeProps> = ({
    value,
    getValue,
}) => {
    const type = value || getValue?.() || undefined;
    const { featureTypes } = useFeatureTypes();
    const IconComponent = getFeatureTypeIcons(type);

    const typeName = featureTypes
        .filter((type) => type.id === value)
        .map((type) => type.name);

    const title = `This is a "${typeName || value}" toggle`;

    return (
        <StyledContainer>
            <Tooltip arrow title={title} describeChild>
                <IconComponent data-loading />
            </Tooltip>
        </StyledContainer>
    );
};
