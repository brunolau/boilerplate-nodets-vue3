import { toNative } from "vue-facing-decorator"
import { TopLevelComponentBase } from "../../common/base-component"
import { AppMenuSet } from "../../components/menu/app-menu-set"
import "./css/dashboard.css"
import { Component } from "../../app/vuetsx"

@Component
class Dashboard extends TopLevelComponentBase {

    protected get breadcrumbItems(): BreadcrumbItem[] {
        return []
    }

    protected get menuItems(): AppMenuItem[] {
        return AppMenuSet.instance.menuItems
    }

    render(h) {
        return (
            <div>
                <div class="d-flex flex-row justify-content-center gap-3" style="min-height:400px">
                    <h1>Hello world!</h1>
                </div>
            </div>
        )
    }
}

export default toNative(Dashboard)
