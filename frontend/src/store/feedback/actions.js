export const SHOW_FEEDBACK = 'SHOW_FEEDBACK';
export const HIDE_FEEDBACK = 'HIDE_FEEDBACK';

export const showFeedback = dispatch => () => dispatch({ type: SHOW_FEEDBACK });

export const hideFeedback = dispatch => () => {
    dispatch({ type: HIDE_FEEDBACK });
};
