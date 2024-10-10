# A class based Vue 3 template using tsx files

Includes also scss/saas and bootstrap 5

Vue 3 alternative of `vue-class-component` package.

This template sets you up so that you can write your components in such a fashion with Vue 3:

```tsx
@Component
class Comp extends Base {
    counter = 1;

    onClick() {
        this.counter++;
    }

    render() {
        return (
            <div class={".root"}>
                {this.counter}
                <Button text="Click me" clicked={this.onClick} layout={ButtonLayout.Primary} />
            </div>
        );
    }
}

export default toNative(Comp);
```

This repo gives you a fresh start with class components in Vue 3 based on the awesome `vue-facing-decorator`-project. To learn more and get some code samples look here:

[vue-facing decorator](https://facing-dev.github.io/vue-facing-decorator/#/)

## Getting started

Pretty straighforward. Clone this repository, do an `pnpm install` and start your vite dev-server with `pnpm dev`. Your app should be listening on `localhost:3000`.

Alternatively you can use just `npm install` and `npm run dev` and remove `pnpm-lock.yaml` file.

## A word on debugging

### Initial setup

This repo is set up for `VSCode` and includes a `launch.json` configured to attach to a running edge instance launched with the `--remote-debugging-port=9222` flag.
I am working heavily with the Edge Tools for VSCode as they make the dev experience seamless - hence the setup.

### Debugging issues with HMR

Vite's HMR breaks your breakpoints. Once you hit save and vite replaces a module your breakpoints will stop. To hit the breakpoints properly again you need to unfortunately do a full page reload. Then breakpoints work again until you do the next change.
You can disable HMR in the vite config, hwever this is not an option for me and I found occasional reloading to be a bearable workaround.

### Credits

This is fork of https://github.com/elemental-mind/class-based-vue3-ts-template which use .vue files instead of .tsx
