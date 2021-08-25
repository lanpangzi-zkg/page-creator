function addSpaces(context, offset) {
    return Array.apply(null, { length: offset || context.spaceOffset }).reduce((spaceStr) => {
        return (spaceStr += context.spaceUnit);
    }, ``);
}
function compose(...fns) {
    const context = this;
    return (...args) => {
        return fns.reduceRight((preResult, fn) => {
            return Array.isArray(preResult) ? fn.apply(context, preResult) : fn.call(context, preResult);
        }, args);
    };
}
function increaseSpaceOffset(context) {
    context.spaceOffset += 1;
}
function decreaseSpaceOffset(context) {
    context.spaceOffset = Math.max(0, (context.spaceOffset - 1));
}
function appendCode(context, codeHost, newCodeStr = '', isBreakLine = true) {
    if (typeof codeHost === 'object') {
        codeHost.source = `${codeHost.source}${formatCodeStr(context, newCodeStr, isBreakLine)}`;
    } else {
        context.sourceCode += formatCodeStr(context, codeHost, isBreakLine);
    }
    return codeHost;
}
function formatCodeStr(context, code, isBreakLine = true) {
    if (isBreakLine) {
        return `${addSpaces(context)}${code}\n`;
    }
    return `${context.inlineSeparate}${code}`;
}
function lowerCaseFirstLetter(string) {
    return string.slice(0, 1).toLowerCase() + string.slice(1);
}
export default addSpaces;
export {
    compose,
    appendCode,
    formatCodeStr,
    increaseSpaceOffset,
    decreaseSpaceOffset,
    lowerCaseFirstLetter,

}