import { ViewModelBase } from "../common/base-component";

export abstract class TsxComponentExtended<P> extends ViewModelBase {
    private vueTsxProps: Readonly<{ ref?: string; key?: string | number }> & Readonly<P>;
}
