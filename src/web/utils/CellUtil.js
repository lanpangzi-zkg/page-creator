/**
 * 计算表单单元格跨列
 * @param {*} colIndex 
 * @param {*} originSpan 
 * @param {*} formItemArr 
 * @param {*} colSpanArr 
 */
const getCellColSpan = (colIndex, originSpan = 1, formItemArr = [], colSpanArr = []) => {
    let finalColSpan = 0;
    // 占据整行
    if (originSpan === colSpanArr.length) {
        finalColSpan = 24;
    } else {
        let locationIndex = 0;
        let total = 0;
        for (let i = 0; i < formItemArr.length; i++) {
            if (formItemArr[i].colIndex >= colIndex) {
                total = total % 24;
                if (total === 0) {
                    locationIndex = 0;
                } else {
                    for (let j = 0; j < colSpanArr.length; j++) {
                        total -= colSpanArr[j];
                        if (total <= 0) {
                            locationIndex = j + 1;
                            j = colSpanArr.length;
                        }
                    }
                }
                i = formItemArr.length;
            } else {
                total += formItemArr[i].colSpan;
            }
        }
        let start = 0;
        let end = 0;
        // 不换行显示
        if (originSpan <= colSpanArr.length - locationIndex) {
            start = locationIndex;
        }
        end = start + originSpan - 1;
        for(; start <= end; start++) {
            finalColSpan += colSpanArr[start];
        }
    }
    return finalColSpan;
};

const strToObj = (str, separator = ';') => {
    if (str) {
        return str.split(separator).reduce((styleObj, styleStr) => {
            const [ name, value ] = styleStr.split(':');
            if (name && value) {
                styleObj[name] = value.replace(/['"\s]/g, '');
            }
            return styleObj;
        }, {});
    }
    return {};
};

const objToStr = (objLike, separator = ';') => {
    if (Object.prototype.toString.call(objLike) === '[object Object]') {
        return Object.keys(objLike).reduce((arr, k) => {
            arr.push(`${k}:${objLike[k]}`);
            return arr;
        }, []).join(separator);
    } else if (Array.isArray(objLike)) {
        return objLike.join(separator);
    }
    return objLike;
};

export default getCellColSpan;

export {
    strToObj,
    objToStr,
};