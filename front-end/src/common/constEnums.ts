// ONLY FOR TYPE SAFETY, REAL DEFINITION IS IN vite.config.ts

const enum Language {
    Slovak = 0,
    English = 1,
    Czech = 2,
    German = 3,
    Latvian = 4,
    Polish = 5,
    Italian = 6,
    Hungarian = 7,
}

const enum Currency {
    EUR = 978,
    CZK = 203,
    GBP = 826,
    HUF = 348,
    PLN = 985,
    RUB = 643,
    USD = 840,
    Undefined = -1,
    Multiple = -2,
}

const enum TryCallApiResult {
    Success = 0,
    Error = 1,
}

const enum ModalSectionMode {
    fieldSet = 0,
    navPills = 1,
}

const enum AppMenuType {
    MenuItem = 0,
    Separator = 1,
}
