import moment from 'moment';

/**
 * @desc 将moment对象转换成字符串
 * @param {*} date 
 * @param {*} formatStr 
 */
const transferDateToStr = (date, formatStr = 'YYYY-MM-DD') => {
    if (date && date.format) {
        return date.format(formatStr);
    }
    return date;
};

const transferDateToMoment = (dateStr, formatStr = 'YYYY-MM-DD') => {
    if (dateStr) {
        return moment(dateStr, formatStr);
    }
    return dateStr;
};

export default transferDateToStr;

export {
    transferDateToStr,
    transferDateToMoment,
};