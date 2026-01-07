import type React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender.tsx';
import { ReactComponent as ArrowRight } from 'assets/icons/arrowRight.svg';
import { ReactComponent as ArrowLeft } from 'assets/icons/arrowLeft.svg';
import { PAGINATION_OPTIONS } from 'utils/paginationConfig';

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
    totalItems?: number;
    pageIndex: number;
    pageSize: number;
    fetchPrevPage: () => void;
    fetchNextPage: () => void;
    setPageLimit: (limit: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
    totalItems,
    pageSize,
    pageIndex = 0,
    fetchPrevPage,
    fetchNextPage,
    setPageLimit,
}) => {
    const itemRange =
        totalItems !== undefined && pageSize && totalItems > 1
            ? `${pageIndex * pageSize + 1}-${Math.min(
                  totalItems,
                  (pageIndex + 1) * pageSize,
              )}`
            : totalItems;
    const pageCount =
        totalItems !== undefined ? Math.ceil(totalItems / pageSize) : 1;
    const hasPreviousPage = pageIndex > 0;
    const hasNextPage = totalItems !== undefined && pageIndex < pageCount - 1;

    return (
        <StyledBoxContainer>
            <StyledTypography>
                {totalItems !== undefined
                    ? `Showing ${itemRange} item${
                          totalItems !== 1 ? 's' : ''
                      } out of ${totalItems}`
                    : ' '}
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
                    Page {pageIndex + 1} of {pageCount}
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
                    value={pageSize}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setPageLimit(Number(event.target.value))
                    }
                >
                    {PAGINATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </StyledSelect>
            </StyledCenterBox>
        </StyledBoxContainer>
    );
};
