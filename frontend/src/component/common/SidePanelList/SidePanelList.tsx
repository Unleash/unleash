import { styled } from '@mui/material';
import { type ReactNode, useState } from 'react';
import { SidePanelListHeader } from './SidePanelListHeader.tsx';
import { SidePanelListItem } from './SidePanelListItem.tsx';

const StyledSidePanelListWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

const StyledSidePanelListBody = styled('div')({
    display: 'flex',
    flexDirection: 'row',
});

const StyledSidePanelHalf = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
});

const StyledSidePanelHalfLeft = styled(StyledSidePanelHalf, {
    shouldForwardProp: (prop) => prop !== 'height' && prop !== 'maxWidth',
})<{ height?: number; maxWidth?: number }>(({ theme, height, maxWidth }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderTop: 0,
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    overflow: 'auto',
    ...(height && { height }),
    ...(maxWidth && { maxWidth }),
}));

const StyledSidePanelHalfRight = styled(StyledSidePanelHalf)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderTop: 0,
    borderLeft: 0,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
}));

type ColumnAlignment = 'start' | 'end' | 'center';

export const StyledSidePanelListColumn = styled('div', {
    shouldForwardProp: (prop) => prop !== 'maxWidth' && prop !== 'align',
})<{ maxWidth?: number; align?: ColumnAlignment }>(
    ({ theme, maxWidth, align = 'start' }) => ({
        display: 'flex',
        flex: 1,
        padding: theme.spacing(2),
        fontSize: theme.fontSizes.smallBody,
        justifyContent: align,
        ...(maxWidth && { maxWidth }),
        textAlign: align,
        alignItems: 'center',
    }),
);

export type SidePanelListColumn<T> = {
    header: string;
    maxWidth?: number;
    align?: ColumnAlignment;
    cell: (item: T) => ReactNode;
};

interface ISidePanelListProps<T> {
    items: T[];
    columns: SidePanelListColumn<T>[];
    sidePanelHeader: string;
    renderContent: (item: T) => ReactNode;
    renderItem?: (item: T, children: ReactNode) => ReactNode;
    height?: number;
    listEnd?: ReactNode;
}

export const SidePanelList = <T extends { id: string | number }>({
    items,
    columns,
    sidePanelHeader,
    renderContent,
    renderItem = (_, children) => children,
    height,
    listEnd,
}: ISidePanelListProps<T>) => {
    const [selectedItem, setSelectedItem] = useState<T>(items[0]);

    if (items.length === 0) {
        return null;
    }

    const activeItem = selectedItem || items[0];
    const leftPanelMaxWidth = columns.every(({ maxWidth }) => Boolean(maxWidth))
        ? columns.reduce((acc, { maxWidth }) => acc + (maxWidth || 0), 0)
        : undefined;

    return (
        <StyledSidePanelListWrapper>
            <SidePanelListHeader
                columns={columns}
                sidePanelHeader={sidePanelHeader}
                leftPanelMaxWidth={leftPanelMaxWidth}
            />
            <StyledSidePanelListBody>
                <StyledSidePanelHalfLeft
                    height={height}
                    maxWidth={leftPanelMaxWidth}
                >
                    {items.map((item) =>
                        renderItem(
                            item,
                            <SidePanelListItem
                                key={item.id}
                                selected={activeItem.id === item.id}
                                onClick={() => setSelectedItem(item)}
                            >
                                {columns.map(
                                    ({ header, maxWidth, align, cell }) => (
                                        <StyledSidePanelListColumn
                                            key={header}
                                            maxWidth={maxWidth}
                                            align={align}
                                        >
                                            {cell(item)}
                                        </StyledSidePanelListColumn>
                                    ),
                                )}
                            </SidePanelListItem>,
                        ),
                    )}
                    {listEnd}
                </StyledSidePanelHalfLeft>
                <StyledSidePanelHalfRight>
                    {renderContent(activeItem)}
                </StyledSidePanelHalfRight>
            </StyledSidePanelListBody>
        </StyledSidePanelListWrapper>
    );
};
