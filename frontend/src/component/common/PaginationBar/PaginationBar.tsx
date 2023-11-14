import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ReactComponent as ArrowRight } from 'assets/icons/arrowRight.svg';
import { ReactComponent as ArrowLeft } from 'assets/icons/arrowLeft.svg';

const StyledPaginationButton = styled(Button)(({ theme }) => ({
    padding: `0 ${theme.spacing(0.8)}`,
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
    nextPage: () => void;
    previousPage: () => void;
    pageIndex: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    setPageSize: (limit: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
    total,
    nextPage,
    previousPage,
    hasPreviousPage,
    hasNextPage,
    pageSize,
    setPageSize,
    pageIndex,
}) => {
    const firstItem = pageIndex * pageSize + 1;
    const lastItem = Math.min(total, (pageIndex + 1) * pageSize);

    return (
        <StyledBoxContainer>
            <StyledTypography>
                Showing {firstItem}-{lastItem} out of {total}
            </StyledTypography>
            <StyledCenterBox>
                <ConditionallyRender
                    condition={hasPreviousPage}
                    show={
                        <StyledPaginationButton
                            variant='outlined'
                            color='primary'
                            onClick={previousPage}
                        >
                            <ArrowLeft />
                        </StyledPaginationButton>
                    }
                />
                <StyledTypographyPageText>
                    Page {pageIndex + 1} of {Math.ceil(total / pageSize)}
                </StyledTypographyPageText>
                <ConditionallyRender
                    condition={hasNextPage}
                    show={
                        <StyledPaginationButton
                            onClick={nextPage}
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
                    value={pageSize}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setPageSize(Number(event.target.value))
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
