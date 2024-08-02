import { styled } from '@mui/material';
import type { EventSchema } from 'openapi';

interface IEventJsonProps {
    entry: EventSchema;
}

export const StyledJsonListItem = styled('li')(({ theme }) => ({
    padding: theme.spacing(4),
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusLarge,
    fontSize: theme.fontSizes.smallBody,

    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: '100%',
    },
}));

const EventJson = ({ entry }: IEventJsonProps) => {
    const localEventData = JSON.parse(JSON.stringify(entry));
    delete localEventData.description;
    delete localEventData.name;
    delete localEventData.diffs;

    const prettyPrinted = JSON.stringify(localEventData, null, 2);

    return (
        <StyledJsonListItem>
            <div>
                <code>{prettyPrinted}</code>
            </div>
        </StyledJsonListItem>
    );
};

export default EventJson;
