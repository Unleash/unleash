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
    Card,
} from '@mui/material';
import { useChangeRequest } from 'hooks/api/getters/useChangeRequest/useChangeRequest';
import { useSuggestChangesApi } from 'hooks/api/actions/useSuggestChangesApi/useSuggestChangesApi';
import { ChangesetDiff } from './ChangesetDiff/ChangesetDiff';

export const SuggestedChanges: VFC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedValue, setSelectedValue] = useState('');
    const { changeRequest, refetchChangeRequest } = useChangeRequest('1234');
    const { approveChangeRequest, requestChangesOnChangeRequest } =
        useSuggestChangesApi();

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onClose = () => setAnchorEl(null);

    const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue((event.target as HTMLInputElement).value);
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();
        console.log(selectedValue);
        if (selectedValue === 'approve') {
            try {
                console.log('approving');
                await approveChangeRequest('1234');
                setSelectedValue('');
                refetchChangeRequest();
                onClose();
                console.log('closing');
            } catch (error) {
                console.log(error);
                // handleError
            }
        } else if (selectedValue === 'requestChanges') {
            try {
                console.log('FIRING');
                await requestChangesOnChangeRequest('1234');
                setSelectedValue('');
                refetchChangeRequest();
                onClose();
            } catch (error) {
                console.log(error);
                // handleError
            }
        }

        // show an error if no action was selected
    };

    // console.log(changeRequest);

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
            <Box
                sx={{
                    border: '1px solid',
                    p: 2,
                    borderColor: theme => theme.palette.dividerAlternative,
                    display: 'flex',
                    gap: 2,
                    flexDirection: 'column',
                }}
            >
                <ChangesetDiff changeSet={changeRequest?.changeSet} />
            </Box>
            <Button variant="contained" onClick={onClick}>
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
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </Box>
            </Popover>
        </Paper>
    );
};
