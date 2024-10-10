// export const VueJsxTransform = {
//     install(vue) {
//         vue.mixin(
//             vue.extend({
//                 beforeCreate() {
//                     const originalCreateElement = this.$createElement;
//                     this.$createElement = (tag: any, data: any, ...children: any[]) => {
//                         if (data != null) {
//                             for (let propName in data) {
//                                 if (propName.indexOf("on") == 0 && propName.length > 2) {
//                                     let eventName = propName.substring(2).toLowerCase();
//                                     if (data.on == null) {
//                                         data.on = {};
//                                     }

//                                     data.on[eventName] = data[propName];
//                                 }
//                             }
//                         }

//                         if (data?.onClick != null) {
//                             console.log(data);
//                             window["kurek"] = data;
//                         }

//                         return originalCreateElement(tag, data, children);
//                     };
//                 },
//             }),
//         );
//     },
// };
