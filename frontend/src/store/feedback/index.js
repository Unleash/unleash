import { HIDE_FEEDBACK, SHOW_FEEDBACK } from './actions';

const feedback = (state = {}, action) => {
    switch (action.type) {
        case SHOW_FEEDBACK:
            return { ...state, show: true };
        case HIDE_FEEDBACK: {
            return { ...state, show: false };
        }
        default:
            return state;
    }
};

export default feedback;
