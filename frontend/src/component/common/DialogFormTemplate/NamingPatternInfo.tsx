import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { FeatureNamingType } from 'interfaces/project';

const StyledFlagNamingInfo = styled('article')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginInlineStart: theme.spacing(1.5),
    backgroundColor: `${theme.palette.background.elevation2}`,
    dl: {
        display: 'grid',
        gridTemplateColumns: 'max-content auto',
        rowGap: theme.spacing(1),
        columnGap: 0,
    },
    dt: {
        color: theme.palette.text.secondary,
        '&::after': { content: '":"' },
    },
    dd: {
        marginInlineStart: theme.spacing(2),
    },
}));

type Props = {
    featureNaming: FeatureNamingType;
};

export const NamingPatternInfo: React.FC<Props> = ({ featureNaming }) => {
    return (
        <StyledFlagNamingInfo>
            <p>The name must match this pattern:</p>
            <dl id='naming-pattern-info'>
                <dt>Pattern</dt>
                <dd>
                    <code>^{featureNaming.pattern}$</code>
                </dd>
                <ConditionallyRender
                    condition={Boolean(featureNaming?.example)}
                    show={
                        <>
                            <dt>Example</dt>
                            <dd>{featureNaming?.example}</dd>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={Boolean(featureNaming?.description)}
                    show={
                        <>
                            <dt>Description</dt>
                            <dd>{featureNaming?.description}</dd>
                        </>
                    }
                />
            </dl>
        </StyledFlagNamingInfo>
    );
};
