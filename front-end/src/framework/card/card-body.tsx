import { toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface CardBodyArgs {}

@Component
class CardBody extends TsxComponent<CardBodyArgs> implements CardBodyArgs {
    render(h) {
        return <div class="card-body ">{this.$slots.default?.()}</div>;
    }
}

export default toNative(CardBody);
