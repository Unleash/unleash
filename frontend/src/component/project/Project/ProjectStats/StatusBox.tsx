import type { ReactNode } from 'react';
import { CallMade, SouthEast } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';

const StyledTypographyHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2.5),
}));

const StyledTypographyCount = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.largeHeader,
}));

const StyledBoxChangeContainer = styled(Box)(({ theme }) => ({
    ...flexRow,
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: theme.spacing(2.5),
}));

const StyledTypographySubtext = styled(Typography)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledTypographyChange = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

interface IStatusBoxProps {
    title?: string;
    boxText: ReactNode;
    change: number;
    percentage?: boolean;
}

const resolveIcon = (change: number) => {
    if (change > 0) {
        return (
            <CallMade sx={{ color: 'success.dark', height: 20, width: 20 }} />
        );
    }
    return <SouthEast sx={{ color: 'warning.dark', height: 20, width: 20 }} />;
};

const resolveColor = (change: number) => {
    if (change > 0) {
        return 'success.dark';
    }
    return 'warning.dark';
};

export const StatusBox = ({
    title,
    boxText,
    change,
    percentage,
}: IStatusBoxProps) => (
    <>
        <ConditionallyRender
            condition={Boolean(title)}
            show={<StyledTypographyHeader>{title}</StyledTypographyHeader>}
        />
        <Box
            sx={{
                ...flexRow,
                justifyContent: 'center',
                width: 'auto',
            }}
        >
            <StyledTypographyCount>{boxText}</StyledTypographyCount>
            <ConditionallyRender
                condition={change !== 0}
                show={
                    <StyledBoxChangeContainer>
                        <Box
                            sx={{
                                ...flexRow,
                            }}
                        >
                            {resolveIcon(change)}
                            <StyledTypographyChange
                                color={resolveColor(change)}
                            >
                                {change > 0 ? '+' : ''}
                                {change}
                                {percentage ? '%' : ''}
                            </StyledTypographyChange>
                        </Box>
                        <StyledTypographySubtext>
                            this month
                        </StyledTypographySubtext>
                    </StyledBoxChangeContainer>
                }
                elseShow={
                    <StyledBoxChangeContainer>
                        <StyledTypographySubtext>
                            No change
                        </StyledTypographySubtext>
                    </StyledBoxChangeContainer>
                }
            />
        </Box>
    </>
);
