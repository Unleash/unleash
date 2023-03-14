import { styled } from '@mui/material';
import EventDiff from 'component/events/EventDiff/EventDiff';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

interface IDiffProps {
    preData: any;
    data: any;
}

const variantsArrayToObject = (arr: any) =>
    arr.reduce((a: any, v: any) => ({ ...a, [v.name]: v }), {});

export const Diff = ({ preData, data }: IDiffProps) => (
    <StyledCodeSection>
        <EventDiff
            entry={{
                preData: variantsArrayToObject(preData),
                data: variantsArrayToObject(data),
            }}
            sort={(a, b) => a.index - b.index}
        />
    </StyledCodeSection>
);
