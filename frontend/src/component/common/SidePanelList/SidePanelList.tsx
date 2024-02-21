import { styled } from '@mui/material';
import { ReactNode, useState } from 'react';

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

interface ISidePanelListProps<T> {
    items: T[];
    header: ReactNode;
    renderItem: (
        item: T,
        isSelected: boolean,
        selectItem: (item: T) => void,
    ) => ReactNode;
    renderContent: (item: T) => ReactNode;
}

export const SidePanelList = <T,>({
    items,
    header,
    renderItem,
    renderContent,
}: ISidePanelListProps<T>) => {
    const [selectedItem, setSelectedItem] = useState<T>(items[0]);

    return (
        <StyledSidePanelListWrapper>
            {header}
            <StyledSidePanelListBody>
                <div className='side-panel-list'>
                    {items.map((item) =>
                        renderItem(
                            item,
                            item === selectedItem,
                            setSelectedItem,
                        ),
                    )}
                </div>
                <div className='side-panel-content'>
                    {renderContent(selectedItem)}
                </div>
            </StyledSidePanelListBody>
        </StyledSidePanelListWrapper>
    );
};
