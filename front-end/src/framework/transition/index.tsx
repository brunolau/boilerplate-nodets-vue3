import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface TransitionArgs {}
import "./css/transition.css";

@Component
class TransitionHolder extends TsxComponent<TransitionArgs> implements TransitionArgs {
    render(h) {
        return (
            <transition name="fade" mode="out-in">
                {this.$slots.default?.()}
            </transition>
        );
    }
}

export default toNative(TransitionHolder);
