import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ReactNode } from 'react';

const StyledItem = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
    position: 'relative',
}));

const StyledItemSeparator = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.seen.primary,
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: theme.spacing(-2),
    left: theme.spacing(2),
    lineHeight: 1,
}));

const StyledInnerBox = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledHeaderRow = styled(StyledRow)(({ theme }) => ({
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
}));

interface IProjectActionsFormItemProps {
    index: number;
    header: ReactNode;
    separator?: string;
    children: ReactNode;
}

export const ProjectActionsFormItem = ({
    index,
    header,
    separator = 'AND',
    children,
}: IProjectActionsFormItemProps) => {
    return (
        <StyledItem>
            <ConditionallyRender
                condition={index > 0}
                show={<StyledItemSeparator>{separator}</StyledItemSeparator>}
            />
            <StyledInnerBox>
                <StyledHeaderRow>{header}</StyledHeaderRow>
                <StyledRow>{children}</StyledRow>
            </StyledInnerBox>
        </StyledItem>
    );
};
