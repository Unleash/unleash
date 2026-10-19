import { useId } from 'react';
import {
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { formFieldLabelId } from 'component/common/FormField/FormField';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import Input from 'component/common/Input/Input';
import { MAX_RATING_SCALE, MIN_RATING_SCALE } from '../../../survey.ts';
import {
    type QuestionDraft,
    type QuestionErrors,
    type QuestionType,
    withType,
} from '../../surveyDraft.ts';

const QUESTION_TYPES: { key: QuestionType; label: string }[] = [
    { key: 'rating', label: 'Rating' },
    { key: 'free-text', label: 'Free text' },
];

const SCALES = Array.from(
    { length: MAX_RATING_SCALE - MIN_RATING_SCALE + 1 },
    (_, index) => {
        const scale = String(MIN_RATING_SCALE + index);
        return { key: scale, label: `${scale} stars` };
    },
);

const StyledCard = styled('li')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 2, 1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

const StyledMainRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 180px 180px',
    alignItems: 'start',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'minmax(0, 1fr)',
    },
}));

const StyledScale = styled('div')({
    width: 180,
});

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

interface QuestionCardProps {
    number: number;
    question: QuestionDraft;
    errors?: QuestionErrors;
    onChange: (question: QuestionDraft) => void;
    onRemove?: () => void;
}

export const QuestionCard = ({
    number,
    question,
    errors = {},
    onChange,
    onRemove,
}: QuestionCardProps) => {
    const promptId = useId();
    const update = (
        fields: Partial<Pick<QuestionDraft, 'id' | 'prompt' | 'required'>>,
    ) => onChange({ ...question, ...fields });

    return (
        <StyledCard role='group' aria-labelledby={formFieldLabelId(promptId)}>
            <StyledMainRow>
                <Input
                    id={promptId}
                    label={`Question ${number}`}
                    value={question.prompt}
                    onChange={(event) => update({ prompt: event.target.value })}
                    error={Boolean(errors.prompt)}
                    errorText={errors.prompt}
                    fullWidth
                />
                <GeneralSelect
                    label='Type'
                    value={question.type}
                    onChange={(type) => onChange(withType(question, type))}
                    options={QUESTION_TYPES}
                />
                <Input
                    label={
                        <>
                            ID
                            <HelpIcon
                                tooltip='Answers to this question are stored under this ID.'
                                size='16px'
                            />
                        </>
                    }
                    value={question.id}
                    onChange={(event) => update({ id: event.target.value })}
                    error={Boolean(errors.id)}
                    errorText={errors.id}
                    fullWidth
                />
            </StyledMainRow>
            {question.type === 'rating' ? (
                <StyledScale>
                    <GeneralSelect
                        label='Scale'
                        value={String(question.scale)}
                        onChange={(scale) =>
                            onChange({ ...question, scale: Number(scale) })
                        }
                        options={SCALES}
                    />
                </StyledScale>
            ) : null}
            <StyledFooter>
                <Tooltip
                    title={
                        onRemove
                            ? 'Remove question'
                            : 'A survey needs at least one question'
                    }
                    arrow
                >
                    <span>
                        <IconButton
                            aria-label='Remove question'
                            onClick={onRemove}
                            disabled={!onRemove}
                        >
                            <DeleteOutlined />
                        </IconButton>
                    </span>
                </Tooltip>
                <Divider orientation='vertical' flexItem />
                <FormControlLabel
                    label='Required'
                    labelPlacement='start'
                    control={
                        <Checkbox
                            checked={question.required}
                            onChange={(event) =>
                                update({ required: event.target.checked })
                            }
                        />
                    }
                />
            </StyledFooter>
        </StyledCard>
    );
};
