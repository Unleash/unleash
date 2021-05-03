import { IYesNoCount } from './index';

export class Projection {
    store: Record<string, IYesNoCount> = {};

    getProjection(): Record<string, IYesNoCount> {
        return this.store;
    }

    add(name: string, countObj: IYesNoCount): void {
        if (this.store[name]) {
            this.store[name].yes += countObj.yes;
            this.store[name].no += countObj.no;
        } else {
            this.store[name] = {
                yes: countObj.yes,
                no: countObj.no,
            };
        }
    }

    substract(name: string, countObj: IYesNoCount): void {
        if (this.store[name]) {
            this.store[name].yes -= countObj.yes;
            this.store[name].no -= countObj.no;
        } else {
            this.store[name] = {
                yes: 0,
                no: 0,
            };
        }
    }
}
