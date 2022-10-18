import { useState, VFC } from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    Popover,
    Radio,
    FormControl,
    FormControlLabel,
    RadioGroup,
} from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangesetDiff } from './ChangesetDiff/ChangesetDiff';
import { ChangesHeader } from './ChangesHeader/ChangesHeader';

export const SuggestedChanges: VFC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedValue, setSelectedValue] = useState('');
    const { data: changeRequest } = useChangeRequest();

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onClose = () => setAnchorEl(null);

    const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue((event.target as HTMLInputElement).value);
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();
        if (selectedValue === 'approve') {
            console.log('approve');
        } else if (selectedValue === 'requestChanges') {
            console.log('requestChanges');
        }
        // show an error if no action was selected
    };

    const onApply = async () => {
        try {
            console.log('apply');
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                borderRadius: theme => `${theme.shape.borderRadiusLarge}px`,
            }}
        >
            <Typography>{changeRequest?.state}</Typography>
            Environment: {changeRequest?.environment}
            <br />
            <ChangesHeader
                author={changeRequest?.createdBy?.name}
                avatar={changeRequest?.createdBy?.imageUrl}
                createdAt={changeRequest?.createdAt}
            />
            <br />
            <ChangesetDiff changeSet={changeRequest?.changeSet} />
            <ConditionallyRender
                condition={changeRequest?.state === 'APPLIED'}
                show={<Typography>Applied</Typography>}
            />
            <ConditionallyRender
                condition={changeRequest?.state === 'APPROVED'}
                show={
                    <>
                        <Button
                            sx={{ mt: 2 }}
                            variant="contained"
                            onClick={onApply}
                        >
                            Apply changes
                        </Button>
                    </>
                }
            />
            <ConditionallyRender
                condition={changeRequest?.state === 'REVIEW'}
                show={
                    <>
                        <Button
                            sx={{ mt: 2 }}
                            variant="contained"
                            onClick={onClick}
                        >
                            Review changes
                        </Button>
                        <Popover
                            id={'review-popover'}
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={onClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <Box
                                component="form"
                                onSubmit={onSubmit}
                                sx={{
                                    padding: '1rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <FormControl>
                                    <RadioGroup
                                        value={selectedValue}
                                        onChange={onRadioChange}
                                        name="review-actions-radio"
                                    >
                                        <FormControlLabel
                                            value="approve"
                                            control={<Radio />}
                                            label="Approve"
                                        />
                                        <FormControlLabel
                                            value="requestChanges"
                                            control={<Radio />}
                                            label="Request changes"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Submit
                                </Button>
                            </Box>
                        </Popover>
                    </>
                }
            />
        </Paper>
    );
};
