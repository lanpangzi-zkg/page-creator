import moment from 'moment';
import { transferDateToStr } from './DateUtil';
import { FORM_QUERY, MODE_ADD, FORM_CONTAINER, FORM_SAVE } from './Constants';

const getFormData = (values, renderArr, hasIndex) => {
    const formData = hasIndex ? [] : {};
    Object.keys(values).forEach((valKey) => {
        let fk = valKey;
        if (hasIndex) {
            if (valKey.indexOf('-') > 0) {
                const [ k, i ] = valKey.split('-');
                fk = k;
                if (isContain(fk, renderArr)) {
                    const item = findItemByRule(({ index }) => index === i, formData);
                    if (item) {
                        item[fk] = values[valKey];
                    } else {
                        formData.push({
                            [fk]: values[valKey],
                            index: i,
                        });
                    }
                }
            }
        } else if (isContain(fk, renderArr)) {
            formData[fk] = values[valKey];
        }
    });
    return formData;
};

const getFormDataByIndex = (values, renderArr, i) => {
    const result ={};
    renderArr.forEach((k) => {
        const indexK = `${k}-${i}`;
        if (Object.hasOwnProperty.call(values, indexK)) {
            result[k] = values[indexK];
            delete values[indexK];
        }
    });
    return result;
};

const isContain = (matchKey, matchArr) => {
    return !!findItemByRule(matchKey, matchArr);
};

const findItemByRule = (rule, matchArr) => {
    const isFn = typeof rule === 'function';
    return matchArr.find((item) => {
        return isFn ? rule(item) : item.key === rule;
    });
};

const getFormApi = (mode, formConfig) => {
    const { formType, queryApi, addApi, editApi } = formConfig;
    return formType === FORM_QUERY ? queryApi : mode === MODE_ADD ? addApi : editApi;
};

const initForm = (form, layoutConfig, initData) => {
    const formObj = layoutConfig.find(({ type, formType }) => {
        return type === FORM_CONTAINER && formType === FORM_SAVE;
    });
    if (formObj && Array.isArray(formObj.formItemArr)) {
        const formData = formObj.formItemArr.reduce((obj, item) => {
            const { type, name, format = 'YYYY-MM-DD', dateKeys } = item;
            if (type === 'DatePicker') {
                obj[name] = moment(initData[name], format);
            } else if (type === 'RangePicker' && dateKeys) {
                const [ startTime, endTime ] = dateKeys;
                if (initData[startTime] && initData[endTime]) {
                    obj[name] = [moment(initData[startTime], format), moment(initData[endTime], format)];
                }
            } else {
                obj[name] = initData[name];
            }
            return obj;
        }, {});
        form.setFieldsValue(formData);
    }
};

const getSubmitData = ({ formItemArr }, values) => {
    formItemArr.forEach(({ type, name, dateKeys, format }) => {
        if (type === 'DatePicker') {
            values[name] = transferDateToStr(values[name], format);
        } else if (type === 'RangePicker' && Array.isArray(values[name]) && values[name].length > 0)  {
            const [ startTime, endTime ] = values[name];
            const [startKey, endKey] = dateKeys.split(',');
            values[startKey] = transferDateToStr(startTime, format);
            values[endKey] = transferDateToStr(endTime, format);
            delete values[name];
        }
    });
    return values;
};

const getFormByType = (layoutConfig = [], type = 'query') => {
    return getFormArr(layoutConfig).find(({ formType }) => {
        return type === formType;
    });
};

const getFormArr = (layoutConfig) => {
    const formArr = layoutConfig.reduce((arr, item) => {
        const { type, cellsArr } = item;
        if (Array.isArray(cellsArr) && cellsArr.length > 0) {
            arr.push(...getFormByType({ layoutConfig: cellsArr }));
        } else if (type === FORM_CONTAINER) {
            arr.push(item);
        }
        return arr;
    }, []);
    return formArr;
};

export {
    initForm,
    getFormApi,
    getFormData,
    getFormByType,
    getSubmitData,
    getFormDataByIndex,
};

export default getFormData;