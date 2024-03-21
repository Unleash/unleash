import type { VFC } from 'react';
import { Box, styled } from '@mui/material';

type DistributionLineTypes = 'default' | 'success' | 'warning' | 'error';

const StyledDistributionLine = styled(Box)<{
    type: DistributionLineTypes;
    size?: 'large' | 'small';
}>(({ theme, type, size = 'large' }) => {
    const color: Record<DistributionLineTypes, string | undefined> = {
        default: theme.palette.secondary.border,
        success: theme.palette.success.border,
        warning: theme.palette.warning.border,
        error: theme.palette.error.border,
    };

    return {
        borderRadius: theme.shape.borderRadius,
        height: size === 'large' ? theme.spacing(2) : theme.spacing(1),
        backgroundColor: color[type],
        marginBottom: theme.spacing(0.5),
    };
});

export const HorizontalDistributionChart: VFC<{
    sections: Array<{ type: DistributionLineTypes; value: number }>;
    size?: 'large' | 'small';
}> = ({ sections, size }) => (
    <Box sx={(theme) => ({ display: 'flex', gap: theme.spacing(0.5) })}>
        {sections.map((section, index) =>
            section.value ? (
                <StyledDistributionLine
                    type={section.type}
                    sx={{ width: `${section.value}%` }}
                    key={`${section.type}-${index}`}
                    size={size}
                />
            ) : null,
        )}
    </Box>
);
