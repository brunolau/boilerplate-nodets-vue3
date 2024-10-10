import "./css/toolbar-user.css";
import AppRoutes from "../../app-routes";
export default class ToolbarUserMenu {
    static renderMenu(h, dummyUser: number) {
        if (AppState.user == null) {
            return null;
        }

        let showSmall = !(AppState.user.Profile.fullName == AppState.user.Profile.email);

        return (
            <div class="dropdown menu-user" data-incrementor={dummyUser}>
                <a href="javascript:" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span>
                        <i class="icon icon-user"></i>
                    </span>
                </a>

                <div class="dropdown-menu dropdown-menu-right dropdown-menu-accout">
                    <div class="user-menu">
                        <div class="user-info text-center p-3">
                            <i class="icon icon-user"></i>
                            <p class="mt-1 mb-0">
                                <span style="display:block">{AppState.user.Profile.fullName}</span>
                                {showSmall && <small style="margin-top: -5px; display: block;">{AppState.user.Profile.email}</small>}
                            </p>
                        </div>
                        <h6 class="dropdown-header">SECTION HEAD</h6>
                        <a class="dropdown-item" href="/home">
                            <i class="fa fa-calendar mr-2"></i>
                            Item 1
                        </a>
                        <a class="dropdown-item" href="/my-tickets">
                            <i class="fa fa-tags"></i>
                            Item 2
                        </a>

                        <div class="dropdown-divider"></div>
                        <h6 class="dropdown-header">SECTION HEAD</h6>
                        <a class="dropdown-item" href="/create-event">
                            <i class="fas fa-fw fa-plus-circle mr-2"></i>
                            Otheritem 1
                        </a>
                        <a class="dropdown-item" href="/acl-checking-selection">
                            <i class="far fa-check-square mr-2"></i>
                            Otheritem 2
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
