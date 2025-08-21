import { styled } from '@mui/material';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import type { IFeatureVariant } from 'interfaces/featureToggle';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

interface IDiffProps {
    preData: IFeatureVariant[];
    data: IFeatureVariant[];
}

const variantsArrayToObject = (variants: IFeatureVariant[]) =>
    variants.reduce(
        (object, { name, ...variant }) => ({ ...object, [name]: variant }),
        {},
    );

export const VariantDiff = ({ preData, data }: IDiffProps) => (
    <StyledCodeSection>
        <EventDiff
            entry={{
                preData: variantsArrayToObject(preData),
                data: variantsArrayToObject(data),
            }}
        />
    </StyledCodeSection>
);
