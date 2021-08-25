import { message } from 'antd';
import moment  from 'moment';

const getInitialValue = (config = {}) => {
    const { component = 'Input', initialValue, format = 'YYYY-MM-DD' } = config;
    if (component === 'DatePicker') {
        return initialValue && moment(initialValue, format);
    }
    if (component === 'Checkbox') {
        return [initialValue];
    }
    return initialValue || '';
}

const arrayRE = /\[[\w, ]+\]/;
const objectRE = /\{[^]+\}/;

function formatValue(value) {
    if (value?.trim) {
        if (value.trim().match(arrayRE) || value.trim().match(objectRE)) {
            try {
                return eval(`(${value})`)
            } catch(err) {
                message.error(`\`${value}\`解析成对象发生异常：${err.message}`);
            }
        }
    }
    return value;
}
const styleRE = /(\w+)\s*:\s*('|")?\s*([\w#_]+)\s*('|")?/g;
function parseStyle(s) {
    let match;
    let style;
    while((match = styleRE.exec(s))) {
        (style = style || {})[match[1]] = isNumber(match[3]) ? Number(match[3]) : match[3];
    }
    return style;
}

const numberRE = /^\d+$/;
function isNumber(n) {
    return n?.match(numberRE);
}

const filterValidProps = (props) => {
    return Object.keys(props || {}).reduce((obj, k) => {
        if (props[k] != null && props[k] !== '') {
            obj[k] = formatValue(props[k]);
        }
        return obj;
    }, {});
};

const nestRE = /^#(\w+)#(\w+)/;
const getNestProps = (props) => {
    const result = {};
    Object.keys(props).filter((k) => {
        return Boolean(k.match(nestRE)); // '#labelCol#sm#span'
    }).forEach((k) => {
        let parent = result;
        let nestPath = '';
        k.slice(1).split('#').forEach((kk) => {
            nestPath = `${nestPath}#${kk}`;
            if (!parent.hasOwnProperty(kk)) {
                parent[kk] = {};
            }
            if (props.hasOwnProperty([nestPath])) {
                if (props[nestPath]) {
                    parent[kk] = props[nestPath];
                } else {
                    delete parent[kk];
                }
            }
            parent = parent[kk];
        });
    });
    return result;
}

const reactiveClassName = (preview) => {
    return preview ? 'preview-box' : 'dashed-box';
};

const separateProps = (props, customKeys = []) => {
    const componentProps = {};
    const customProps = {};
    if (props) {
        Object.entries(props).forEach(([k, v]) => {
            if (customKeys.includes(k) || k.match(nestRE)) {
                customProps[k] = v;
            } else {
                componentProps[k] = v;
            }
        });
    }
    return {
        customProps,
        componentProps,
    };
};

export default getInitialValue;
export {
    parseStyle,
    getNestProps,
    separateProps,
    filterValidProps,
    reactiveClassName,
};