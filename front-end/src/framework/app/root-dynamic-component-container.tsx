import { toNative, Vue } from "vue-facing-decorator";
import DynamicComponentContainer from "./dynamic-component-container";
import { Component } from "../../app/vuetsx";

@Component
class RootDynamicComponentContainer extends Vue implements IDynamicComponentContainer {
    created() {
        window["RootDynamicContainerInstance"] = this;
    }

    getInstance<T>(uuid: string): T {
        return this.getContainer().getInstance(uuid);
    }

    addInstance(uuid: string, componentConstructor: any) {
        this.getContainer().addInstance(uuid, componentConstructor);
    }

    showLazyLoadedModal(args: DynamicComponentLazyLoadedModalArgs): Promise<any> {
        return this.getContainer().showLazyLoadedModal(args);
    }

    private getContainer() {
        return this.$refs.dynamicContainer as typeof DynamicComponentContainer.prototype;
    }

    render(h) {
        return <DynamicComponentContainer ref="dynamicContainer" />;
    }
}

export default toNative(RootDynamicComponentContainer);
