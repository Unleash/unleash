import { styled } from '@mui/material';
import { ReactNode, useState } from 'react';
import { SidePanelListHeader } from './SidePanelListHeader';
import { SidePanelListItem } from './SidePanelListItem';

const StyledSidePanelListWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
    '& > *': {
        flex: 1,
    },
});

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
}

export const SidePanelList = <T extends { id: string | number }>({
    items,
    columns,
    sidePanelHeader,
    renderContent,
}: ISidePanelListProps<T>) => {
    const [selectedItem, setSelectedItem] = useState<T>(items[0]);

    return (
        <StyledSidePanelListWrapper>
            <SidePanelListHeader
                columns={columns}
                sidePanelHeader={sidePanelHeader}
            />
            <StyledSidePanelListBody>
                <StyledSidePanelHalf>
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
                </StyledSidePanelHalf>
                <StyledSidePanelHalf>
                    {renderContent(selectedItem)}
                </StyledSidePanelHalf>
            </StyledSidePanelListBody>
        </StyledSidePanelListWrapper>
    );
};
