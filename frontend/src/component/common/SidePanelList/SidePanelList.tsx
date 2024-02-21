import { styled } from '@mui/material';
import { ReactNode, useState } from 'react';
import { SidePanelListHeader } from './SidePanelListHeader';
import { SidePanelListItem } from './SidePanelListItem';

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
    shouldForwardProp: (prop) => prop !== 'maxHeight',
})<{ maxHeight?: number }>(({ theme, maxHeight }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderTop: 0,
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    overflow: 'auto',
    ...(maxHeight && { maxHeight }),
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
        flex: 1,
        padding: theme.spacing(2),
        fontSize: theme.fontSizes.smallBody,
        justifyContent: align,
        ...(maxWidth && { maxWidth }),
        textAlign: align,
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
    maxHeight?: number;
}

export const SidePanelList = <T extends { id: string | number }>({
    items,
    columns,
    sidePanelHeader,
    renderContent,
    maxHeight,
}: ISidePanelListProps<T>) => {
    const [selectedItem, setSelectedItem] = useState<T>(items[0]);

    if (items.length === 0) {
        return null;
    }

    return (
        <StyledSidePanelListWrapper>
            <SidePanelListHeader
                columns={columns}
                sidePanelHeader={sidePanelHeader}
            />
            <StyledSidePanelListBody>
                <StyledSidePanelHalfLeft maxHeight={maxHeight}>
                    {items.map((item) => (
                        <SidePanelListItem
                            key={item.id}
                            selected={selectedItem.id === item.id}
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
                        </SidePanelListItem>
                    ))}
                </StyledSidePanelHalfLeft>
                <StyledSidePanelHalfRight>
                    {renderContent(selectedItem)}
                </StyledSidePanelHalfRight>
            </StyledSidePanelListBody>
        </StyledSidePanelListWrapper>
    );
};
