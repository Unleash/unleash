import { StateMachine, transition } from './state-machine';

export enum Events {
    SUBMIT,
    REJECT,
    APPROVE,
    REQUEST_CHANGES,
    APPLY,
    CANCEL,
}

export enum States {
    DRAFT,
    IN_REViEW,
    APPROVED,
    CHANGES_REQUESTED,
    APPLIED,
    REJECTED,
    CANCELLED,
}
/* eslint-disable */
class ApprovalFlow extends StateMachine<States, Events> {

    constructor(init: States = States.DRAFT) {

        super(init);

        const s = States;
        const e = Events;


        this.addTransitions([
            //    fromState            event             toState                  callback
            transition(s.DRAFT,            e.SUBMIT,         s.IN_REViEW,              this.onSubmitted.bind(this)),
            transition(s.DRAFT,            e.CANCEL,         s.CANCELLED,              this.onCancelled.bind(this)),
            transition(s.IN_REViEW,        e.APPROVE,        s.APPROVED,               this.onApproved.bind(this)),
            transition(s.APPROVED,         e.APPLY,          s.APPLIED,                this.onApplied.bind(this)),
            transition(s.APPROVED,         e.CANCEL,         s.CANCELLED,              this.onCancelled.bind(this)),
            transition(s.IN_REViEW,        e.CANCEL,         s.CANCELLED,              this.onCancelled.bind(this)),
            transition(s.IN_REViEW,        e.REQUEST_CHANGES,s.CHANGES_REQUESTED,      this.onChangesRequested.bind(this)),
            transition(s.IN_REViEW,        e.REJECT,         s.REJECTED,               this.onRejected.bind(this)),
            transition(s.CHANGES_REQUESTED,e.SUBMIT,         s.DRAFT,                  this.onSubmitted.bind(this)),
        ]);

    }

    // public methods
    async submitDraft() { return this.dispatch(Events.SUBMIT); }

    async cancel() { return this.dispatch(Events.CANCEL); }

    async approve() { return this.dispatch(Events.APPROVE); }
    async apply() { return this.dispatch(Events.APPLY); }
    async reject() { return this.dispatch(Events.REJECT); }
    async requestChanges() { return this.dispatch(Events.REQUEST_CHANGES); }


    // transition callbacks
    private async onSubmitted() {
        console.log(`onSubmitted...`);
    }

    private async onRejected() {
        console.log(`onRejected...`);
    }


    private async onChangesRequested() {
       console.log(`onApproved...`);
    }

    private async onCancelled() {
        console.log(`onCancelled...`);
    }

    private async onApproved() {
        console.log(`onApproved...`);
    }

    private async onApplied() {
        console.log(`onApplied...`);
    }
    /* eslint-enable */
}
