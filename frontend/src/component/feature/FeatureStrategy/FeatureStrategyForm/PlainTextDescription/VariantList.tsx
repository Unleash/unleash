import { styled } from '@mui/material';
import { calculateVariantWeight } from 'component/common/util';
import type { StrategyVariantSchema } from 'openapi';

export const variantDisplayName = (variant: StrategyVariantSchema) =>
    variant.name || 'unnamed variant';

const PayloadInfo = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    '::before': {
        content: '" — "',
    },
}));

export const VariantList = styled(
    ({
        variants,
        ...props
    }: {
        variants?: StrategyVariantSchema[];
        className?: string;
    }) => (
        <ul
            // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none: https://bugs.webkit.org/show_bug.cgi?id=170179
            role='list'
            {...props}
        >
            {variants?.map((variant, index) => (
                <li key={index}>
                    <strong>{calculateVariantWeight(variant.weight)}%</strong>{' '}
                    get <strong>{variantDisplayName(variant)}</strong>
                    <PayloadInfo>
                        {variant.payload
                            ? `${variant.payload.type} payload`
                            : 'no payload set'}
                    </PayloadInfo>
                </li>
            ))}
        </ul>
    ),
)(({ theme }) => {
    const colors = theme.palette.variants;
    const markerColors = Object.fromEntries(
        colors.map((color, i) => [
            `& > li:nth-of-type(${colors.length}n + ${i + 1})`,
            { '--variant-color': color },
        ]),
    );
    const markerSize = theme.spacing(1);
    const markerGap = theme.spacing(1);
    return {
        ':empty': { display: 'none' },
        '--left-padding': `calc(${markerSize} + ${markerGap})`,
        paddingInlineStart: 'var(--left-padding)',
        listStyle: 'none',
        'li + li': {
            marginBlockStart: theme.spacing(1.5),
        },
        '& > li::before': {
            content: '""',
            display: 'inline-block',
            width: markerSize,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            marginRight: markerGap,
            marginLeft: `calc(-1 * var(--left-padding))`,
            backgroundColor: 'var(--variant-color)',
            border: `1px solid ${theme.palette.text.secondary}`,
            boxSizing: 'content-box', // avoid border overflowing container
        },
        ...markerColors,
    };
});
