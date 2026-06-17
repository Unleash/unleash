import { Divider, IconButton, Tooltip, styled } from '@mui/material';
import FileCopy from '@mui/icons-material/FileCopy';
import Codebox from '../Codebox/Codebox.tsx';

type Props = {
    command: string;
    onCopy: () => void;
    /** When true, suppress the divider above the subtitle. */
    hideDivider?: boolean;
};

const StyledDivider = styled(Divider)(({ theme }) => ({
    opacity: 0.3,
    marginBottom: theme.spacing(0.5),
}));

const StyledSubtitle = styled('h2')(({ theme }) => ({
    color: theme.palette.common.white,
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

const StyledIcon = styled(FileCopy)(({ theme }) => ({
    fill: theme.palette.primary.contrastText,
}));

const StyledCodeboxWrapper = styled('div')(() => ({
    maxHeight: '320px',
    overflow: 'auto',
}));

export const ApiCommandBlock: React.FC<Props> = ({
    command,
    onCopy,
    hideDivider,
}) => (
    <>
        {hideDivider ? null : <StyledDivider />}
        <StyledSubtitle>
            API Command{' '}
            <Tooltip title='Copy command' arrow>
                <IconButton onClick={onCopy} size='large'>
                    <StyledIcon />
                </IconButton>
            </Tooltip>
        </StyledSubtitle>
        <StyledCodeboxWrapper>
            <Codebox text={command} />
        </StyledCodeboxWrapper>
    </>
);
