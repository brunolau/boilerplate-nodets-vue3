export interface IManagementEditModal {
    show(args: IManagementEditModalDisplayArgs);
}

interface IManagementEditModalDisplayArgs {
    itemId: number;
    newSortOrder?: number;
    completed: (e: IManagementEditModalResponse) => void;
    isCopy?: boolean;
}

interface IManagementEditModalResponse {
    isNew: boolean;
    itemModel: any;
}

export interface IManagementViewModal {
    show(args: IManagementViewModalDisplayArgs): void;
}

interface IManagementViewModalDisplayArgs {
    itemId: number;
    hidden: () => void;
}

export interface IManagementQuickEditModal {
    show(args: IManagementQuickEditModalDisplayArgs);
}

export interface IManagementQuickEditModalDisplayArgs {
    items: any[];
    apiClient: IWebApiClient;
    onComplete: () => void;
    onHidden?: () => void;
}
