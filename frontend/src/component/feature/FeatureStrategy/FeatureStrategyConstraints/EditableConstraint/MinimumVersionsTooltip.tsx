import { styled } from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type { FC } from 'react';

const MinimumVersionsLabel = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline dotted',
    cursor: 'default',
}));

type MinimumVersionsTooltipProps = {
    minimumVersions: [sdk: string, version: string][];
};

export const MinimumVersionsTooltip: FC<MinimumVersionsTooltipProps> = ({
    minimumVersions,
}) => (
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
