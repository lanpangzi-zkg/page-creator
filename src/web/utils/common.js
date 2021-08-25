import moment  from 'moment';
import { FORM_CONTAINER, TABLE_CONTAINER, EMPTY_CONTAINER, BOX_CONTINAER, HEADER_CONTINAER, LINE_CONTINAER } from './Constants';

const containerArr = [FORM_CONTAINER, TABLE_CONTAINER, EMPTY_CONTAINER, BOX_CONTINAER, HEADER_CONTINAER, LINE_CONTINAER];

const isContainer = (type) => {
    return containerArr.indexOf(type) > -1;
};

const isLogin = () => {
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('webapi');
}

const isIndex = (i) => {
    return (/\d+/).test(i);
};

const getInitialValue = (config = {}) => {
    const { type = 'Input', initialValue, format = 'YYYY-MM-DD' } = config;
    if (type === 'DatePicker') {
        return initialValue && moment(initialValue, format);
    }
    if (type === 'Checkbox') {
        return [initialValue];
    }
    return initialValue || '';
}

const getStyle = (config) => {
    const { type, cellStyles, textAlign } = config;
    return type === 'Button' ? Object.assign({}, cellStyles, { textAlign }) : cellStyles || {};
};

export {
    isLogin,
    isIndex,
    getStyle,
    getInitialValue,
};

export default isContainer;