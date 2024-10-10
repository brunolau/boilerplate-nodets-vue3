import { STATUS } from "../../api/data-contracts/enums";

export default class CauseHelper {
    static getCauseId(causeID: number, status: STATUS): number {
        if (status == STATUS.OPEN) {
            return null;
        }

        return causeID;
    }
}
