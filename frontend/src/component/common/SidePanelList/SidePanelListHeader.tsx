import { styled } from '@mui/material';
import {
    type SidePanelListColumn,
    StyledSidePanelListColumn,
} from './SidePanelList.tsx';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: theme.shape.borderRadiusMedium,
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.table.headerBackground,
}));

const StyledHeaderHalf = styled('div', {
    shouldForwardProp: (prop) => prop !== 'maxWidth',
})<{ maxWidth?: number }>(({ maxWidth }) => ({
    display: 'flex',
    flex: 1,
    ...(maxWidth && { maxWidth }),
}));

interface ISidePanelListHeaderProps<T> {
    columns: SidePanelListColumn<T>[];
    sidePanelHeader: string;
    leftPanelMaxWidth?: number;
}

export const SidePanelListHeader = <T,>({
    columns,
    sidePanelHeader,
    leftPanelMaxWidth,
}: ISidePanelListHeaderProps<T>) => (
    <StyledHeader>
        <StyledHeaderHalf maxWidth={leftPanelMaxWidth}>
            {columns.map(({ header, maxWidth, align }) => (
                <StyledSidePanelListColumn
                    key={header}
                    maxWidth={maxWidth}
                    align={align}
                >
                    {header}
                </StyledSidePanelListColumn>
            ))}
        </StyledHeaderHalf>
        <StyledHeaderHalf>
            <StyledSidePanelListColumn>
                {sidePanelHeader}
            </StyledSidePanelListColumn>
        </StyledHeaderHalf>
    </StyledHeader>
);
