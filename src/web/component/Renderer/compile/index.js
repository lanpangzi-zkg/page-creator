import { message } from "antd";

const expressionRE = /^[\w\s.*/\+\-\[\]'"\u0025()]+(?:===|==|>=|<=|>|<|!==)[\w\s.*/\+\-\[\]'"\u0025()]+;*$/; // 匹配返回为Boolean的表达式

/**
 * @desc 根据表达式生成函数主体
 * @param {string} exp 
 */
function getBody(exp) {
    const match = typeof exp === 'string' && exp.match(expressionRE);
    if (match) { // exp是`this.state.xx === true`形式返回Boolean类型的语句，那么需要在函数执行完毕返回该Boolean值
        return `return (${exp.replace(/;/g, '')});`; // 需要删除;分号，否则return(...;)会有语法错误
    }
    return exp;
}

function createFunction(exp, defaultReturn) {
    let fn = () => defaultReturn;
    if (exp) {
        try {
            fn = new Function('context', 'event', `with(context) {${getBody(exp)}}`);
        } catch (error) {
            message.error(`${exp}表达式语法错误:${error.message}`);
        }
    }
    return fn;
}

function execute(context, e, exp, defaultReturn = true) {
    const fn = createFunction(exp, defaultReturn);
    try {
        return fn.call(context, context, e);
    } catch (error) {
        message.error(`${exp}表达式执行异常:${error.message}`);
    }
}

function emptyFunc() {}

export default execute;

export {
    getBody,
    emptyFunc,
}