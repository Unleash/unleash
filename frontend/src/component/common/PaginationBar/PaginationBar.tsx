import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ReactComponent as ArrowRight } from 'assets/icons/arrowRight.svg';
import { ReactComponent as ArrowLeft } from 'assets/icons/arrowLeft.svg';

const StyledPaginationButton = styled(Button)(({ theme }) => ({
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    minWidth: 'auto',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledTypographyPageText = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledBoxContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

const StyledCenterBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

const StyledSelect = styled('select')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(1),
    color: theme.palette.text.primary,
}));

interface PaginationBarProps {
    total: number;
    currentOffset: number;
    fetchPrevPage: () => void;
    fetchNextPage: () => void;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    pageLimit: number;
    setPageLimit: (limit: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
    total,
    currentOffset,
    fetchPrevPage,
    fetchNextPage,
    hasPreviousPage,
    hasNextPage,
    pageLimit,
    setPageLimit,
}) => {
    const calculatePageOffset = (
        currentOffset: number,
        total: number,
    ): string => {
        if (total === 0) return '0-0';

        const start = currentOffset + 1;
        const end = Math.min(total, currentOffset + pageLimit);

        return `${start}-${end}`;
    };

    const calculateTotalPages = (total: number, offset: number): number => {
        return Math.ceil(total / pageLimit);
    };

    const calculateCurrentPage = (offset: number): number => {
        return Math.floor(offset / pageLimit) + 1;
    };

    return (
        <StyledBoxContainer>
            <StyledTypography>
                Showing {calculatePageOffset(currentOffset, total)} out of{' '}
                {total}
            </StyledTypography>
            <StyledCenterBox>
                <ConditionallyRender
                    condition={hasPreviousPage}
                    show={
                        <StyledPaginationButton
                            variant='outlined'
                            color='primary'
                            onClick={fetchPrevPage}
                        >
                            <ArrowLeft />
                        </StyledPaginationButton>
                    }
                />
                <StyledTypographyPageText>
                    Page {calculateCurrentPage(currentOffset)} of{' '}
                    {calculateTotalPages(total, pageLimit)}
                </StyledTypographyPageText>
                <ConditionallyRender
                    condition={hasNextPage}
                    show={
                        <StyledPaginationButton
                            onClick={fetchNextPage}
                            variant='outlined'
                            color='primary'
                        >
                            <ArrowRight />
                        </StyledPaginationButton>
                    }
                />
            </StyledCenterBox>
            <StyledCenterBox>
                <StyledTypography>Show rows</StyledTypography>

                {/* We are using the native select element instead of the Material-UI Select 
                component due to an issue with Material-UI's Select. When the Material-UI 
                Select dropdown is opened, it temporarily removes the scrollbar, 
                causing the page to jump. This can be disorienting for users. 
                The native select does not have this issue, 
                as it does not affect the scrollbar when opened. 
                Therefore, we use the native select to provide a better user experience. 
                */}
                <StyledSelect
                    value={pageLimit}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setPageLimit(Number(event.target.value))
                    }
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={75}>75</option>
                    <option value={100}>100</option>
                </StyledSelect>
            </StyledCenterBox>
        </StyledBoxContainer>
    );
};
