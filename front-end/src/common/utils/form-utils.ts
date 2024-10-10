export interface FormUtilsField {
    name: string;
    value: string;
}

export default class FormUtils {
    static nonAjaxPost(url: string, obj: any, newWindow?: boolean): void;
    static nonAjaxPost(url: string, fieldArr: FormUtilsField[], newWindow?: boolean): void;
    static nonAjaxPost(url: string, fieldArrOrObj: FormUtilsField[] | any, newWindow?: boolean): void {
        var arr: FormUtilsField[];
        if (fieldArrOrObj.constructor === Array) {
            arr = fieldArrOrObj;
        } else {
            arr = [];
            for (var key in fieldArrOrObj) {
                if (fieldArrOrObj.hasOwnProperty(key)) {
                    arr.push({
                        name: key,
                        value: fieldArrOrObj[key],
                    });
                }
            }
        }

        var formMethod = "POST";
        var formName = "frm" + new Date().getTime().toString();
        var newForm = '<form id="' + formName + '" method="' + formMethod + '" action="' + url + '" ' + (newWindow == true ? 'target="_blank"' : "") + ">";

        arr.forEach((field) => {
            var newElem = $('<div><input type="hidden" name="' + field.name + '" /></div>');
            $("input", newElem).val(field.value);
            newForm += newElem.html();
        });

        newForm += "</form>";

        var newFormElem = $(newForm);
        $("body").append(newFormElem);
        newFormElem.submit();

        setTimeout(function () {
            newFormElem.remove();
        }, 50);
    }
}
