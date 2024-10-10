export default class FlagsEnum {
    /**
     * Determines if flag-enum contains specified flag
     *
     * @param value Value of the flag-enum
     * @param flag Flag searched
     */
    static enumHasFlag(value: number, flag: number): boolean {
        return (value & flag) == flag;
    }

    /**
     * Adds flag to enum if not already present
     *
     * @param value Value of the flag-enum
     * @param flag Flag searched
     */
    static addFlagToEnum(value: number, flag: number): number {
        if (!FlagsEnum.enumHasFlag(value, flag)) {
            value += flag;
        }

        return value;
    }

    /**
     * Removes flag from the enum if present
     *
     * @param value Value of the flag-enum
     * @param flag Flag searched
     */
    static removeFlagFromEnum(value: number, flag: number): number {
        if (FlagsEnum.enumHasFlag(value, flag)) {
            value -= flag;
        }

        return value;
    }

    /**
     * Toggles flags enum to given state
     *
     * @param value Value of the flag-enum
     * @param flag Flag searched
     * @param present Determines if the flag is presented
     */
    static toggleEnumFlag(value: number, flag: number, present: boolean): number {
        if (present) {
            return FlagsEnum.addFlagToEnum(value, flag);
        } else {
            return FlagsEnum.removeFlagFromEnum(value, flag);
        }
    }
}
