import { useId } from 'react';
import {
    Checkbox,
    Collapse,
    FormControlLabel,
    styled,
    Typography,
} from '@mui/material';
import Input from 'component/common/Input/Input';
import type { SurveyDraft } from '../surveyDraft.ts';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

type TitleSlide = Pick<SurveyDraft, 'showTitleSlide' | 'title' | 'description'>;

interface SurveyTitleSlideProps {
    titleSlide: TitleSlide;
    titleError?: string;
    onChange: (titleSlide: TitleSlide) => void;
}

export const SurveyTitleSlide = ({
    titleSlide,
    titleError,
    onChange,
}: SurveyTitleSlideProps) => {
    const hintId = useId();
    const update = (fields: Partial<TitleSlide>) =>
        onChange({ ...titleSlide, ...fields });

    return (
        <section aria-label='Title slide'>
            <Typography variant='h3' component='h2'>
                Title slide
            </Typography>
            <FormControlLabel
                label='Show title slide'
                control={
                    <Checkbox
                        checked={titleSlide.showTitleSlide}
                        onChange={(event) =>
                            update({ showTitleSlide: event.target.checked })
                        }
                        slotProps={{ input: { 'aria-describedby': hintId } }}
                    />
                }
            />
            <Typography id={hintId} variant='body2' color='text.secondary'>
                Shown before the first question.
            </Typography>
            <Collapse in={titleSlide.showTitleSlide} unmountOnExit>
                <StyledCard>
                    <Input
                        label='Title'
                        value={titleSlide.title}
                        onChange={(event) =>
                            update({ title: event.target.value })
                        }
                        error={Boolean(titleError)}
                        errorText={titleError}
                        fullWidth
                    />
                    <Input
                        label='Description'
                        description='Optional. Shown under the title.'
                        value={titleSlide.description}
                        onChange={(event) =>
                            update({ description: event.target.value })
                        }
                        multiline
                        minRows={2}
                        fullWidth
                    />
                </StyledCard>
            </Collapse>
        </section>
    );
};
