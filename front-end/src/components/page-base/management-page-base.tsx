import { IWebApiClient } from "../../api/IWebClient"
import { TopLevelComponentBase } from "../../common/base-component"
import { DataTableStatic } from "../../framework/datatable/datatable-static"
import { IManagementEditModal, IManagementQuickEditModal, IManagementViewModal } from "./management-page-contracts"

export interface ManagementPageQueryParseAction {
    actionName: string
    handler: (itemId: number) => void
}

export abstract class ManagementPageBase extends TopLevelComponentBase {
    protected abstract getEditModal(): IManagementEditModal
    protected abstract getViewModal(): IManagementViewModal
    protected abstract getQuickEditModal(): IManagementQuickEditModal
    protected abstract getTable(): DataTableStatic
    protected abstract reloadData(enforceReload?: boolean): Promise<void>
    protected abstract get modelArr(): { id: number }[]
    protected abstract get baseApiClient(): IWebApiClient

    async mounted() {
        this.handleBeforeMount([
            {
                actionName: "edit",
                handler: (itemId: number) => {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.showEditModal(itemId)
                        }, 50)
                    })
                },
            },
            {
                actionName: "view",
                handler: (itemId: number) => {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.showViewModal(itemId)
                        }, 50)
                    })
                },
            },
        ])

        await this.reloadData(true)
    }

    protected handleBeforeMount(actionList: ManagementPageQueryParseAction[]) {
        const url = location.href.split("?")[0]
        const splitArr = url.split("/")
        const actionName = splitArr[4]?.toLowerCase()
        const actionItem = actionList.find((p) => p.actionName == actionName)

        if (actionItem != null) {
            let itemId: number = null
            try {
                itemId = Number(splitArr[splitArr.length - 1])
                if (isNaN(itemId)) {
                    itemId = null
                }
            } catch (error) {
                itemId = null
            }


            if (itemId != null) {
                actionItem.handler(itemId);
            }
        }
    }

    protected showEditModal(itemId: number, isCopy?: boolean) {
        const editModal = this.getEditModal()
        if (editModal == null) {
            return
        }

        this.onBeforeEditModalShow(itemId)
        editModal.show({
            itemId: itemId,
            isCopy: isCopy,
            newSortOrder: (this.modelArr?.length ?? 0) + 2,
            completed: (e) => {
                this.onAfterEditModalHidden()

                if (e == null) {
                    return
                }

                if (!e.isNew) {
                    let existingItem = this.modelArr.find((p) => p.id == e.itemModel.id)
                    if (existingItem != null) {
                        let index = this.modelArr.indexOf(existingItem)
                        if (index > -1) {
                            this.modelArr.remove(existingItem)
                            this.modelArr.insertAt(e.itemModel, index)
                        }
                    }
                } else {
                    this.modelArr.push(e.itemModel)
                    this.reloadData(true)
                }
            },
        })
    }

    protected showViewModal(itemId: number) {
        const viewModal = this.getViewModal()
        if (viewModal == null) {
            return
        }

        this.setModalActionUrl("view", itemId)
        viewModal.show({
            itemId: itemId,
            hidden: () => {
                this.clearModalActionUrl()
            },
        })
    }

    protected showQuickEditModal() {
        const quickEditModal = this.getQuickEditModal()
        if (quickEditModal == null) {
            return
        }

        const table = this.getTable()
        if (table == null) {
            return
        }

        const selectedItems = table.getSelectedRows()
        if (!isNullOrEmpty(selectedItems)) {
            quickEditModal.show({
                items: selectedItems,
                apiClient: this.baseApiClient,
                onComplete: () => {
                    this.reloadData()
                },
            })
        }
    }

    protected setModalActionUrl(actionName: string, itemId: number) {
        this.setCurrentUrl(this.getUrlForModalAction(actionName, itemId))
    }

    protected clearModalActionUrl() {
        this.setCurrentUrl(this.cleanUrl(location.href))
    }

    protected onBeforeEditModalShow(itemId: number) {
        this.setModalActionUrl("edit", itemId)
    }

    protected onAfterEditModalHidden() {
        this.clearModalActionUrl()
    }

    protected setCurrentUrl(url: string) {
        history.replaceState(null, null, url)
        this.$nextTick(() => {
            history.replaceState(null, null, url)
        })

        setTimeout(() => {
            history.replaceState(null, null, url)
        }, 500)
    }

    protected normalizeStringForSearch(str: string): string {
        return this.getTable().normalizeStringForSearch(str)
    }

    private cleanUrl(url: string) {
        url = url.split("?")[0]

        if (url.contains("/edit/")) {
            url = url.substring(0, url.indexOf("/edit/"))
        }

        if (url.contains("/view/")) {
            url = url.substring(0, url.indexOf("/view/"))
        }

        if (url.contains("/rents/")) {
            url = url.substring(0, url.indexOf("/rents/"))
        }

        return url
    }

    private getUrlForModalAction(actionName: string, itemId: number) {
        return `${this.cleanUrl(location.href)}/${actionName}/${itemId}`.replace(`//${actionName}`, `/${actionName}`)
    }
}
