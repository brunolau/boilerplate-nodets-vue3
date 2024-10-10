import { createDecorator } from "vue-facing-decorator";

export function NamePreserver(name: string) {
    return createDecorator((componentOptions, k) => {
        componentOptions.name = name;
    }) as any;
}
