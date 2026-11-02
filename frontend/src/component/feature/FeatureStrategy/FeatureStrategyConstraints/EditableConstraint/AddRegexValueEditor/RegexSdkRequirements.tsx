import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type { FC } from 'react';

const MinimumVersionsLabel = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline dotted',
    cursor: 'default',
}));

const minimumVersions = [
    ['Node.js', '6.10.0'],
    ['Java', '12.2.0'],
    ['Ruby', '6.5.0'],
    ['Python', '6.6.0'],
    ['.NET', '6.1.0'],
    ['Go', '6.2.0'],
    ['Rust', '0.16.0'],
    [
        'Edge',
        'Frontend SDK connected to Unleash or Unleash Enterprise Edge: 20.1.9',
    ],
    ['PHP', 'Not supported'],
];

export const MinimumVersionsTooltip: FC = () => (
    <HtmlTooltip
        arrow
        title={
            <table>
                <tbody>
                    {minimumVersions.map(([sdk, version]) => (
                        <tr key={sdk}>
                            <td>{sdk}</td>
                            <td>{version}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        }
    >
        <MinimumVersionsLabel>Check minimum version</MinimumVersionsLabel>
    </HtmlTooltip>
);
