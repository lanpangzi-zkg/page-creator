import { getBody } from '../../../../Renderer/compile';
import { apiParamMapRE, stateRE, formRE } from '../../../helper';
import addSpaces, { compose, formatCodeStr, appendCode, increaseSpaceOffset, decreaseSpaceOffset, lowerCaseFirstLetter } from '../tool';

function beforeParseComponent(context, config) {
    const render = ensureLifeCycle(context);
    increaseSpaceOffset(context, config);
    config && context.walkStack.push(config);
    return render;
}
function afterParseComponent(context, config) {
    decreaseSpaceOffset(context, config);
    context.walkStack.pop(config);
}
function isNotEmptyValue(v) {
    return v != null && v !== '' && v === v; // 排除空值和NAN
}
function getObjectStringStart(objectString, tag) {
    return `${objectString.slice(0, objectString.indexOf(tag) + tag.length)}\n`;
}
function wrapObjectStringEnd(str, spaces, tag) {
    return `${str}\n${spaces}${tag}`;
}
const KeyValueRE = /(["'\w]+):\s*(\[[\w,."'`]+\]|[\w+._"'`]+)/g;
function breakObjectString(context, objectString, keepFormatQueue = []) {
    const spaces = addSpaces(context, context.spaceOffset + 1);
    const nextSpaces = addSpaces(context, context.spaceOffset + 2);
    if (objectString.includes('={{')) { // 对象
        let match = null;
        const codeStrQueue = [];
        while((match = KeyValueRE.exec(objectString))) {
            codeStrQueue.push(`${nextSpaces}${match[1]}: ${keepFormatQueue.includes(match[1]) ? match[2] : stringify(match[2])}`);
        }
        return getObjectStringStart(objectString, '={{') + wrapObjectStringEnd(codeStrQueue.join(',\n'), spaces, '}}');
    }
    if (objectString.includes('={[')) { // 数组
        const match = objectString.match(/\{\[([^]+)\]\}/);
        if (match) {
            try {
                const arr = eval(`([${match[1]}])`);
                return getObjectStringStart(objectString, '={[') + wrapObjectStringEnd(arr.reduce((arr, item) => {
                    arr.push(`${nextSpaces}${stringify(item)}`);
                    return arr;
                }, []).join(',\n'), spaces, ']}');
            } catch(err) {
                console.log(err.message);
            }
        }
    }
    // 事件
    return objectString;
}
const notNumberRE = /[^\d]/;
const ArrayRE = /\[([\w_, "']+)\]/; // [..,..]
const refrenceRE = /this./;
const markRE = /("|')[^\d]+\1/; // '...' "..."
function stringify(val) {
    if (Array.isArray(val)) {
        return `[${val.reduce((str, item) => {
            return str += `${typeof item ==='string' ? `"${item}"` : item},`
        }, ``).slice(0, -1)}]`;
    }
    if (typeof val === 'object') {
        const dynamicValueQueue = [];
        let result =  JSON.stringify(val, function(_, v) {
            if (typeof v === 'string' && v.includes('this.')) {
                dynamicValueQueue.push(v);
                return '*';
            }
            return v;
        });
        dynamicValueQueue.forEach((item) => {
            result = result.replace(/\"\*\"/, item);
        });
        return result;
    }
    if (val?.match(ArrayRE) || val?.match(refrenceRE)) {
        return val;
    }
    if (val?.match(notNumberRE) && !val?.match(markRE)) { // 不是纯数字且没有被引号包裹，需要手动添加
        return `"${val}"`;
    }
    return val;
}
const complexObjectRE = /\{\{[^]+\}\}|\{\([^]*?\)\s*=>[^]+\}|\{\[[^]+\]\}/; // {{...}} {[...]} {() =>...} 匹配对象、数组、函数
function addPropsToCode(context, propsQueue, keepFormatQueue) {
    let hasComplexObject = false;
    propsQueue.forEach((propItem, i) => {
        if (propItem.match(complexObjectRE)) {
            propsQueue[i] = breakObjectString(context, propItem, keepFormatQueue);
            hasComplexObject = true;
        }
    });
    if (propsQueue.length >= 3 || hasComplexObject) { // 属性值大于3个或则有对象属性值，需要折行
        increaseSpaceOffset(context);
        const result = propsQueue.reduce((propsCodeStr, codeItem) => {
            propsCodeStr += `${formatCodeStr(context, codeItem)}`;
            return propsCodeStr;
        }, `\n`);
        decreaseSpaceOffset(context);
        return result + addSpaces(context);
    }
    if (propsQueue.length > 0) {
        return ` ${propsQueue.join(' ')}`;
    }
    return '';
}
function patchProps(context, props) {
    return Object.keys(props)
    .filter((k) => {
        return isNotEmptyValue(props[k]) && k !== 'submitId' && k !== 'rules';
    })
    .reduce((arr, key) => {
        arr.push(`${parseSingleProp(context, key, props)}`);
        return arr;
    }, [])
    .sort((a, b) => {
        return a.length - b.length;
    });
}
const doubleBracketRE = /\{\s*?\{[^]+\}\s*?\}/; // {{ .... }}
const singleBracketRE = /\{[^]+\}/; // { ... }

function parseSingleProp(context, key, props) {
    const value = props[key];
    const walkStack = context.walkStack;
    const currentConfig = walkStack[walkStack.length - 1];
    const propEditValues = currentConfig?.editProps[key];
    if (propEditValues?.type === 'Boolean') { //  属性值是Boolean类型
        if (value === 'true' || value === true) {
            return `${key}`;
        }
        return `${key}={false}`;
    }
    if (propEditValues?.type === 'Number') {
        return `${key}={${value}}`;
    }
    if (key === 'style') { // 组件行类样式属性
        const inlineValue = deleteExpSpace(value); // 删除换行符和空白符，否则源码格式不好处理
        if (inlineValue.match(doubleBracketRE)) { // 已经被双花括号包裹，不做处理
            return `${key}=${inlineValue}`;
        }
        if (inlineValue.match(singleBracketRE)) { // 被单括号包裹，需要再加一层花括号
            return `${key}={${inlineValue}}`;
        }
        return `${key}={{${inlineValue}}}`; // 添加两层花括号
    }
    if (Array.isArray(value)) {
        return `${key}={[${stringifyArrayTypeValue(value)}]}`;
    }
    return `${key}="${value}"`;
}
function stringifyArrayTypeValue(arr) {
    const result = arr.reduce((strQueue, item) => {
        strQueue.push(JSON.stringify(item, (k, v) => {
            if (isNotEmptyValue(v) && k !== 'uid') {
                return v;
            }
            return undefined;
        }));
        return strQueue;
    }, []);
    return result.join(', ')
}
function addImport(context, name, packageName = 'antd', isDefaultImport = false) {
    let packageObj = context.imports.find(({ packageName: pkgName }) => {
        return 	pkgName === packageName;
    });
    if (!packageObj) {
        packageObj = {
            packageName,
            defaultImport: '',
            namedImport: [],
        };
        context.imports.push(packageObj);
    }
    if (isDefaultImport) {
        packageObj.defaultImport = name;
        return;
    }
    const { namedImport } = packageObj;
    if (namedImport && !namedImport.includes(name)) {
        namedImport.push(name);
    }
}
function ensureLifeCycle(context, method = 'render') {
    if (!context.lifeCycles[method]) {
        increaseSpaceOffset(context);
        increaseSpaceOffset(context);
        context.lifeCycles[method] = {
            source: ``,
            dynamics: [],
        };
        if (method === 'render') {
            if (context.modalConfig) {
                addImport(context, 'Modal');
                context.lifeCycles[method].source = helpers.Modal(context, context.modalConfig);
            } else {
                const { pageConfig } = context;
                let containerEleTag = `<div>`;
                if (pageConfig?.style) {
                    containerEleTag = `<div ${parseSingleProp(context, 'style', pageConfig)}>`;
                }
                context.lifeCycles[method].source = `\n${formatCodeStr(context, containerEleTag)}`;
            }
        }
    }
    return context.lifeCycles[method];
}
function only(rawObj, keys, reverse = false) {
    return Object.keys(rawObj).reduce((obj, k) => {
        if (reverse) {
            if (!keys.includes(k)) {
                obj[k] = rawObj[k];
            }
        } else {
            if (keys.includes(k)) {
                obj[k] = rawObj[k];
            }
        }
        return obj;
    }, {});
}
function deleteExpSpace(expression) {
    return expression?.replace(/(\n|\r|\t|\f| )/g, '');
}
function getRenderCondition(expression) {
    if (expression) {
        return `(() => {${getBody(expression)}}()) && `;
    }
    return '';
}
function getEventHandler(expression, eventType, modalName, requestApi) {
    switch(eventType) {
        case 'requestApi':
            const apiObj = getApiById(context, requestApi);
            return `{() => { ${apiObj ? `this.${apiObj.alias()};` : ''} }}`;
        case 'openModal':
            return `{() => { this.setState({ ${modalName}Visible: true }); }}`;
        default:
            if (expression) {
                return `{(event) => {${deleteExpSpace(expression)}}}`;
            }
            return null;
    }
}
/**
 * @desc 换行新增一行子代码，同时增加缩进，保证嵌套格式
 * @param {object} context 
 * @param {string} code 
 */
function addNewChildLine(context, codeObj, newCodeStr) {
    increaseSpaceOffset(context);
    appendCode(context, codeObj, newCodeStr);
    decreaseSpaceOffset(context);
}
/**
 * @desc 换行新增一行父代码，首先减小缩进，然后追加代码
 * @param {*} context 
 * @param {*} codeObj 
 * @param {*} newCodeStr 
 */
function addNewParentLine(context, codeObj, newCodeStr) {
    decreaseSpaceOffset(context);
    appendCode(context, codeObj, newCodeStr);
}
/**
 * @desc 解析子组件及其自身配置
 * @param {*} context 
 * @param {*} config 
 * @param {*} subComponent 对于有嵌套子组件且不是容器组件，如Select/Option，指定义子组件的渲染标签
 */
function parseWithDFS(context, config, inForm, subComponent) {
    const { schemaProps, component, importName, logicProps } = config;
    addImport(context, importName || component);
    let rawProps = schemaProps;
    let isContainerComponent = true;
    if (Array.isArray(schemaProps.children) && subComponent) {
        const { children, ...rest } = schemaProps;
        rawProps = rest;
        isContainerComponent = false;
    }
    const render = beforeParseComponent(context, config);
    const propsQueue = patchProps(context, rawProps);
    const logicQueue = patchLogic(context, logicProps);
    propsQueue.push(...logicQueue);
    let renderWithoutFieldDecorator = true;
    if (inForm && config.canWrapFieldDecorator) {
        wrapFieldDecorator(context, render, config?.schemaProps || {});
        increaseSpaceOffset(context);
        increaseSpaceOffset(context);
        appendCode(context, render, `<${component}${addPropsToCode(context, propsQueue)}>`);
        decreaseSpaceOffset(context);
        appendCode(context, render, '</Form.Item>');
        renderWithoutFieldDecorator = false;
    }
    renderWithoutFieldDecorator && appendCode(context, render, `${getRenderCondition(logicProps?.isRender)}<${component}${addPropsToCode(context, propsQueue)}>`);
    if (isContainerComponent) {
        parseChildren(config.children, context, inForm);
    } else {
        parseSubComponents(schemaProps.children, context, subComponent);
    }
    appendCode(context, render, `</${component}>`);
    if (!renderWithoutFieldDecorator) {
        decreaseSpaceOffset(context);
        appendCode(context, render, `)}`);
    }
    afterParseComponent(context, config);
}
function parseWithChildNode(context, config, isAddImport = true) {
    const { schemaProps = {}, component } = config;
    const { label, ...rest } = schemaProps;
    const render = beforeParseComponent(context, config);
    isAddImport && addImport(context, `${component}`);
    const propsQueue = patchProps(context, rest);
    if (label) {
        appendCode(context, render, `<${component}${addPropsToCode(context, propsQueue)}>`);
        addNewChildLine(context, render, label);
        appendCode(context, render, `</${component}>`);
    } else {
        appendCode(context, render, `<${component}${addPropsToCode(context, propsQueue)}/>`);
    }
    afterParseComponent(context, config);
}
function parseChildren(children, context, inForm = false) {
    if (Array.isArray(children)) {
        children.forEach((child) => {
            const { component } = child;
            const parseHelper = context.helpers[component];
            parseHelper && parseHelper(context, child, inForm);
        });
    }
}
function parseSubComponents(children, context, component) {
    if (Array.isArray(children)) {
        children.forEach((child) => {
            subComponent(context, child, component);
        });
    }
}
function subComponent(context, config, component) {
    const render = beforeParseComponent(context, config);
    const { label } = config;
    const propName = config.hasOwnProperty('href') ? 'href' : 'value';
    const propValue = config[propName];
    appendCode(context, render, `<${component} ${propName}={"${propValue}"}>`);
    addNewChildLine(context, render, `${label}`);
    appendCode(context, render, `</${component}>`);
    afterParseComponent(context, config);
}
function addMethodToContext(context, name, param, body) {
    if (context.customMethods.hasOwnProperty(name)) {
        return;
    }
    const spaces = addSpaces(context, 1);
    context.customMethods[name] = `${spaces}${name} = (${param}) => {\n`;
    body.split('\n').forEach((line) => {
        context.customMethods[name] += `${spaces}${spaces}${line}\n`;
    }); 
    context.customMethods[name] += `${spaces}}\n`;
}
function addStateToContext(context, name, value = '') {
    const spaces = addSpaces(2);
    context.state[name] = `${spaces}${name}: ${value},`;
}
function getApiById(context, id) {
    return context.pageApiQueue.find(({ uid }) => {
        return uid === id;
    });
}
function getPayload(context, api) {
    const { paramsMap, paginationParamsMap, isPagination } = api;
    const spaces = addSpaces(context, 2);
    const payloadQueue = [];
    if (isPagination) {
        addStateToContext(context, `pageIndex`, 1);
        addStateToContext(context, `pageSize`, 10);
        const [pIndex, pSize] = paginationParamsMap.split(',').map((s) => s.trim());
        payloadQueue.push(`${pIndex}: this.state.${pIndex}`);
        payloadQueue.push(`${pSize}: this.state.${pSize}`);
    }
    if (paramsMap) {
        paramsMap.split(',')
        .map((s) => s.trim())
        .forEach((item) => {
            const match = item.match(apiParamMapRE);
            if (match) {
                const [_, paramKey, paramType, mapExp] = match; // 'a:number = 123' => ["a:number = 123", "a", ":number", "123"]
                if (mapExp.match(stateRE)) {
                    addStateToContext(context, paramKey,  null);
                    payloadQueue.push(`${paramKey}: this.state.${paramKey}`);
                } else if (mapExp.match(formRE)) {
                    payloadQueue.push(`${paramKey}: this.props.form.getFieldValue('${paramKey}')`);
                } else {
                    payloadQueue.push(`${paramKey}: ${mapExp}`);
                }
            }
        });
    }
    if (payloadQueue.length > 0) {
        payloadQueue.push(`...payload`);
        return `{\n${spaces}` + payloadQueue.join(`,\n${spaces}`) + `\n${addSpaces(context, 1)}}`;
    }
    return ``;
}
function createOnSubmitMethod(context, bindApi) {
    const spaces = addSpaces(context, 1);
    const lSpaces = addSpaces(context, 2);
    const xlSpaces = addSpaces(context, 3);
    const api = getApiById(context, bindApi);
    const onSubmitBodyQueue = [`e && e.preventDefault();`];
    onSubmitBodyQueue.push(`this.props.form.validateFields((err, values) => {`);
    onSubmitBodyQueue.push(`${spaces}if (!err) {`);
    if (context.modalConfig) {
        const { addRequestApi, editRequestApi, onOkCallBackRequestApi } = context.modalConfig;
        const addApiObj = getApiById(context, addRequestApi);
        const editApiObj = getApiById(context, editRequestApi);
        const callbackApiObj = getApiById(context, onOkCallBackRequestApi);
        let payload = `${lSpaces}const payload = {...values};\n`;
        let sentence = '';
        let type = '';
        if (addApiObj || editApiObj) {
            if (addApiObj && editApiObj) {
                sentence = 'const { mode, editRecord } = this.props.modalProps || {};';
                const dynamicExecAlias = '${mode === \'edit\' ?' + ` '${editApiObj.alias}' : '${addApiObj.alias}'}`;
                type = `type: \`${getNamespace(context)}/${dynamicExecAlias}\`,`;
                // payload += `${lSpaces} mode === 'edit' ? ${getPayload(context, editApiObj)} : ${getPayload(context, addApiObj)}\n`;
            } else if (addApiObj) {
                sentence = 'const { mode } = this.props.modalProps || {};';
                type = `type: '${getNamespace(context)}/${addApiObj.alias}',`;
            } else if (editApiObj) {
                sentence = 'const { mode, editRecord = {} } = this.props.modalProps || {};';
                type = `type: '${getNamespace(context)}/${editApiObj.alias}',`;
            }
            if (editApiObj) {
                payload += `${lSpaces}if (mode === 'edit') {\n`;
                payload += `${xlSpaces}Object.assign(payload, editRecord);\n`;
                payload += `${lSpaces}}\n`;
            }
            onSubmitBodyQueue.push(`${lSpaces}${sentence}`);
            onSubmitBodyQueue.push(`${payload.slice(0, -1)}`);
            onSubmitBodyQueue.push(`${lSpaces}this.props.dispatch({`);
            onSubmitBodyQueue.push(`${xlSpaces}${type}`);
            onSubmitBodyQueue.push(`${xlSpaces}payload: payload,`);
            onSubmitBodyQueue.push(`${lSpaces}}).then(({ code, message: msg }) => {`);
            onSubmitBodyQueue.push(`${xlSpaces}if (code === 0) { this.props.onClose(${callbackApiObj ? 'e, true': ''}); }`);
            addImport(context, 'message');
            onSubmitBodyQueue.push(`${xlSpaces}else { message.error(msg); }`);
            onSubmitBodyQueue.push(`${lSpaces}});`);
        }
    } else {
        api && onSubmitBodyQueue.push(`${lSpaces}this.${api.alias}(values);`);
    }
    onSubmitBodyQueue.push(`${spaces}}`);
    onSubmitBodyQueue.push(`});`);
    addMethodToContext(context, 'onSubmit', 'e', onSubmitBodyQueue.join('\n'));
}
function wrapFieldDecorator(context, render,{ submitId = 'id', rules }) {
    appendCode(context, render, '<Form.Item>');
    increaseSpaceOffset(context);
    if (Array.isArray(rules) && rules.length > 0) {
        appendCode(context, render, `{getFieldDecorator('${submitId}', {`);
        const ruleStrQueue = rules.reduce((arr, rule) => {
            const ruleQueue = [];
            Object.entries(rule)
            .filter(([k, v]) => Boolean(v) && k !== 'uid')
            .forEach(([k, v]) => {
                ruleQueue.push(`${k}: ${k === 'message' || k === 'type' ? `"${v}"` : v}`);
            });
            arr.push(`{${ruleQueue.join(', ')}}`);
            return arr;
        }, []);
        addNewChildLine(context, render, `rules: [${ruleStrQueue.join(',')}]`);
        appendCode(context, render, `})(`);
    } else {
        appendCode(context, render, `{getFieldDecorator('${submitId}')(`);
    }
    decreaseSpaceOffset(context);
}
const helpers = {
    Modal(context, config) {
        const {
            uid,
            name,
            width,
            centered,
            rootConfigs,
            supportMode,
            maskClosable,
            addRequestApi,
            editRequestApi,
            initRequestApi,
            onOkCallBackRequestApi,
            ...rest
        } = config;
        const propsQueue = patchProps(context, rest);
        if (centered) {
            propsQueue.push(`centered`);
        }
        propsQueue.push(`visible={this.props.visible}`);
        if (maskClosable != null) {
            propsQueue.push(`maskClosable${!centered ? '={false}' : ''}`);
        }
        if (width != null) {
            propsQueue.push(`width={${parseFloat(width)}}`);
        }
        propsQueue.push(`onCancel={this.props.onClose}`);
        const spaces = addSpaces(context, 1);
        const lSpaces = addSpaces(context, 2);
        const xlSpaces = addSpaces(context, 3);
        if (addRequestApi || editRequestApi) {
            createOnSubmitMethod(context, addRequestApi || editRequestAp);
        }
        if (supportMode.includes('edit')) {
            const didUpdateBodyQueue = [`if (!prevProps.visible && this.props.visible) {`];
            didUpdateBodyQueue.push(`${spaces}const { mode, editRecord } = this.props.modalProps || {};`);
            didUpdateBodyQueue.push(`${spaces}if (mode === 'edit') {`);
            const api = getApiById(context, initRequestApi);
            if (initRequestApi && api) {
                didUpdateBodyQueue.push(`${lSpaces}this.props.dispatch({`);
                didUpdateBodyQueue.push(`${xlSpaces}type: '${getNamespace(context)}/${api.alias}',`);
                didUpdateBodyQueue.push(`${xlSpaces}payload: ${getPayload(context, api) || 'editRecord'}`);
                didUpdateBodyQueue.push(`${lSpaces}}).then(({ code, data }) => {`);
                didUpdateBodyQueue.push(`${xlSpaces}code === 0 && this.props.form.setFieldsValue(data);`)
                didUpdateBodyQueue.push(`${lSpaces}});`);
            } else {
                didUpdateBodyQueue.push(`${lSpaces}this.props.form.setFieldsValue(editRecord);`);
            }
            didUpdateBodyQueue.push(`${spaces}}`);
            didUpdateBodyQueue.push(`}`);
            addMethodToContext(context, 'componentDidUpdate', 'prevProps', didUpdateBodyQueue.join('\n'));
        }
        propsQueue.push(`onOk={this.onSubmit}`);
        if (addRequestApi || editRequestApi) {
            propsQueue.push(`afterClose={() => { this.props.form.resetFields(); }}`);
        }
        return `\n${formatCodeStr(context, `<Modal${addPropsToCode(context, propsQueue)}>`)}`;
    },
    Table(context, config) {
        const { schemaProps = {} } = config;
        const render = beforeParseComponent(context, config);
        addImport(context, 'Table');
        if (Array.isArray(schemaProps.columns) && schemaProps.columns.length > 0) {
            // 操作列render需要单独处理
            const operation = schemaProps.columns.find(({ dataIndex }) => {
                return dataIndex === 'operation';
            });
            if (operation?.render) {
                const { operations, operationTitle = '操作', operationWidth, operationFixed } = schemaProps;
                operation.title = operationTitle;
                if(operationWidth) {
                    operation.width = operationWidth;
                }
                if (operationFixed) {
                    operation.fixed = operationFixed;
                }
                if (Array.isArray(operations) && operations.length > 0) {
                    const spaces = addSpaces(context, 1);
                    const lSpaces = addSpaces(context, 2);
                    const xlSpaces = addSpaces(context, 3);
                    const xxlSpaces = addSpaces(context, 4);
                    operation.render = `this.renderTableOperation`;
                    const renderQueue = ['return ('];
                    renderQueue.push(`${spaces}<React.Fragment>`);
                    operations.forEach((item, i) => {
                        const { type, title, confirmText, deleteRequestApi, target } = item;
                        if (type === 'delete') {
                            const apiObj = getApiById(context, deleteRequestApi);
                            apiObj && context.requireApis.add(deleteRequestApi);
                            const deleteHandlerStr = `(e) => { ${apiObj?.alias ? `this.${apiObj?.alias}(e, record); `: '' }}`;
                            if (confirmText) {
                                addImport(context, 'Popconfirm');
                                renderQueue.push(`${lSpaces}<Popconfirm`);
                                renderQueue.push(`${xlSpaces}key="${type}"`);
                                renderQueue.push(`${xlSpaces}okText="是"`);
                                renderQueue.push(`${xlSpaces}cancelText="否"`);
                                renderQueue.push(`${xlSpaces}title="${confirmText}"`);
                                renderQueue.push(`${xlSpaces}onConfirm={${deleteHandlerStr}}`);
                                renderQueue.push(`${lSpaces}>`);
                                renderQueue.push(`${xlSpaces}<a href="#">${title}</a>`);
                                renderQueue.push(`${lSpaces}</Popconfirm>`);
                            } else {
                                renderQueue.push(`${lSpaces}<a key="${type}" onClick={${deleteHandlerStr}}>${title}</a>`);
                            }
                        } else {
                            const otherHandlerStr = `() => { this.setState({ modalProps: { mode: '${type}', editRecord: record}${target ? `, ${target}Visible: true` : '' } }); }`;
                            renderQueue.push(`${lSpaces}<a`);
                            renderQueue.push(`${xlSpaces}key="${type}"`);
                            renderQueue.push(`${xlSpaces}onClick={`);
                            renderQueue.push(`${xxlSpaces}${otherHandlerStr}`);
                            renderQueue.push(`${xlSpaces}}`);
                            renderQueue.push(`${lSpaces}>`);
                            renderQueue.push(`${xlSpaces}${title}`);
                            renderQueue.push(`${lSpaces}</a>`);
                        }
                        if (i !== operations.length - 1) {
                            addImport(context, 'Divider');
                            renderQueue.push(`${lSpaces}<Divider type="vertical" />`);
                        }
                    });
                    renderQueue.push(`${spaces}</React.Fragment>`);
                    renderQueue.push(');');
                    addMethodToContext(context, 'renderTableOperation', 'text, record', renderQueue.join('\n'));
                }
            }
        }
        const propsQueue = patchProps(context, only(schemaProps, ['operations', 'requestApi', 'operationTitle', 'operationWidth', 'operationFixed'], true));
        const apiObj = getApiById(context, schemaProps.requestApi);
        if (apiObj?.modelKey) {
            const { modelKey } = apiObj;
            render.dynamics.push(`${addSpaces(context, 2)}const { ${modelKey}: list${schemaProps.pagination ? `, ${modelKey}Total: listTotal` : ''} } = this.props.${getNamespace(context)};\n`); 
        }
        if (schemaProps.pagination) { // 分页
            apiObj && context.requireApis.add(schemaProps.requestApi);
            render.dynamics.push(`${addSpaces(context, 2)}const { pageIndex, pageSize } = this.state;\n`);
            const callback = apiObj ? `, () => {${context.exports.wrapForm ? `this.onSubmit()` : `this.${apiObj.alias}()`};}` : '';
            // 添加分页相关方法
            addMethodToContext(context, 'onShowSizeChange', 'current, size', `this.setState({
    pageIndex: 1,
    pageSize: size
}${callback});`);
            addMethodToContext(context, 'onPageChange', 'page, pageSize', `this.setState({
    pageSize,
    pageIndex: page
}${callback})`);
            addStateToContext(context, 'pageIndex', 1);
            addStateToContext(context, 'pageSize', schemaProps.pageSize);
            let pagination = [
                'pageSize',
                'pageSizeOptions',
                'showQuickJumper',
                'showSizeChanger',
            ].reduce((str, prop) => {
                const propValue = schemaProps[prop];
                if (isNotEmptyValue(propValue)) {
                    if (prop !== 'pageSize') {
                        if (prop === 'pageSizeOptions') {
                            str += `${prop}: [${propValue.split(',').map(JSON.stringify).join(',')}], `;
                        } else {
                            str += `${prop}: ${propValue}, `
                        }
                    }
                    const index = propsQueue.findIndex((item) => {
                        return item.includes(prop);
                    });
                    propsQueue.splice(index, 1);
                }
                return str;
            }, `pagination={{ pageSize: pageSize, total: listTotal, current: pageIndex, `);
            pagination += `onChange: this.onPageChange, onShowSizeChange: this.onShowSizeChange }}`
            propsQueue[propsQueue.indexOf('pagination')] = pagination;
        }
        propsQueue.push(`dataSource={${apiObj ? 'list || ' : ''}[]}`);
        if (!schemaProps.columns) { // 设置默认值
            propsQueue.push(`columns={[]}`);
        }
        appendCode(context, render, `<Table${addPropsToCode(context, propsQueue, ['pageSize', 'total', 'current'])}/>`);
        afterParseComponent(context, config);
    },
    RadioGroup(context, config, inForm) {
        parseWithDFS(context, config, inForm, 'Radio.Group');
    },
    Checkbox(context, config, inForm) {
        const render = beforeParseComponent(context, config);
        const { schemaProps, logicProps = {} } = config;
        addImport(context, 'Checkbox');
        const propsQueue = patchProps(context, schemaProps);
        const logicQueue = patchLogic(context, logicProps);
        propsQueue.push(...logicQueue);
        formComponentRender(context, config, render, propsQueue, inForm, 'Checkbox.Group', logicProps?.isRender);
        afterParseComponent(context, config);
    },
    DatePicker(context, config, inForm) {
        const render = beforeParseComponent(context, config);
        addImport(context, 'DatePicker');
        addImport(context, 'moment', 'moment', true);
        const { logicProps = {}, schemaProps } = config;
        const propsQueue = patchProps(context, schemaProps);
        const logicQueue = patchLogic(context, logicProps);
        propsQueue.push(...logicQueue);
        formComponentRender(context, config, render, propsQueue, inForm, 'DatePicker', logicProps?.isRender);
        afterParseComponent(context, config);
    },
    Breadcrumb(context, config, inForm) {
        parseWithDFS(context, config, inForm, 'Breadcrumb.Item');
    },
    Select(context, config, inForm) {
        parseWithDFS(context, config, inForm, 'Select.Option');
    },
    span(context, config) {
        parseWithChildNode(context, config, false);
    },
    Divider(context, config) {
        parseWithChildNode(context, config);
    },
    Row(context, config, inForm) {
        parseWithDFS(context, config, inForm);
    },
    Col(context, config, inForm) {
        parseWithDFS(context, config, inForm);
    },
    Icon(context, config) {
        parseWithChildNode(context, config);
    },
    Button(context, config) {
        const render = beforeParseComponent(context, config);
        addImport(context, 'Button');
        const { logicProps = {}, schemaProps } = config;
        const { eventName, openModal, confirmText, disabled, isRender, eventType, requestApi } = logicProps;
        const propsQueue = patchProps(context, only(schemaProps, ['text'], true));
        context.requireApis.add(requestApi);
        let eventHandler;
        if (eventName) {
            eventHandler = getEventHandler(logicProps[eventName], eventType, openModal, requestApi);
        }
        if (disabled) {
            propsQueue.push(`disabled={(() => {${getBody(deleteExpSpace(disabled))}})()}`);
        }
        if (confirmText) { // 点击之前有确认提示
            addImport('Popconfirm');
            appendCode(context, render, `<Popconfirm`);
            addNewChildLine(context, render, `okText="是"`);
            addNewChildLine(context, render, `cancelText="否"`);
            addNewChildLine(context, render, `title="${confirmText}"`);
            if (eventHandler) {
                addNewChildLine(context, render, `onConfirm=${eventHandler}`);
            }
            appendCode(context, render, `>`);
            increaseSpaceOffset(context);
        }
        
        if (!confirmText && eventHandler) {
            propsQueue.push(`${eventName}=${eventHandler}`);
        }
        const { text = '', htmlType } = schemaProps;
        const clickIndex = propsQueue.findIndex((p) => {
            return p.includes(`${eventName}=`);
        });
        if (htmlType === 'submit' && clickIndex >= 0) { // 去掉click事件
            propsQueue.splice(clickIndex, 1);
        }
        if (htmlType === 'reset' && clickIndex >= 0) { // 重写
            propsQueue[clickIndex] = `${eventName}={() => { this.props.form.resetFields(); }}`;
        }
        appendCode(context, render, `${getRenderCondition(isRender)}<Button${addPropsToCode(context, propsQueue)}>`);
        addNewChildLine(context, render, text);
        appendCode(context, render, `</Button>`);
        if (confirmText) {
            addNewParentLine(context, render, `</Popconfirm>`);
        }
        afterParseComponent(context, config);
    },
    Form(context, config) {
        const render = beforeParseComponent(context, config);
        addImport(context, 'Form');
        addImport(context, 'Row');
        context.exports.wrapForm = true; // export default需要包裹Form.create()
        const { children, schemaProps, logicProps } = config;
        const formProps = {};
        let labelCol, wrapperCol;
        const customNestProps = ['#labelCol#xs#span', '#labelCol#sm#span', '#wrapperCol#xs#span', '#wrapperCol#sm#span'];
        Object.entries(schemaProps)
        .forEach(([k, v]) => {
            if (customNestProps.includes(k)) {
                if (v == null) {
                    return;
                }
                const [_, name, childProp, grandsonProp] = k.split('#');
                if (name === 'labelCol') {
                    labelCol = labelCol || {};
                    if (!labelCol.hasOwnProperty(childProp)) {
                        labelCol[childProp] = {};
                    }
                    labelCol[childProp][grandsonProp] = v;
                } else {
                    wrapperCol = wrapperCol || {};
                    if (!wrapperCol.hasOwnProperty(childProp)) {
                        wrapperCol[childProp] = {};
                    }
                    wrapperCol[childProp][grandsonProp] = v;
                }
            } else {
                formProps[k] = v;
            }
        })
        const propsQueue = patchProps(context, only(formProps, ['col'], true));
        propsQueue.push(`onSubmit={this.onSubmit}`);
        if (labelCol) {
            propsQueue.push(`labelCol={${JSON.stringify(labelCol)}}`);
        }
        if (wrapperCol) {
            propsQueue.push(`wrapperCol={${JSON.stringify(wrapperCol)}}`);
        }
        createOnSubmitMethod(context, logicProps?.requestApi);
        if (logicProps?.requestApi) {
            context.requireApis.add(logicProps.requestApi);
        }
        appendCode(context, render, `<Form${addPropsToCode(context, propsQueue)}>`);
        // return 之前的动态解构逻辑
        render.dynamics.push(`${addSpaces(context, 2)}const { form } = this.props;\n`); 
        render.dynamics.push(`${addSpaces(context, 2)}const { getFieldDecorator } = form;\n`);
        increaseSpaceOffset(context);
        appendCode(context, render, `<Row>`);
        parseChildren(children, context);
        appendCode(context, render, `</Row>`);
        decreaseSpaceOffset(context);
        appendCode(context, render, `</Form>`);
        afterParseComponent(context, config);
    },
    FormItem(context, config) {
        const render = beforeParseComponent(context, config);
        const { children = [], schemaProps } = config;
        const { schemaProps: { col } } = config.return;
        const { colspan = 1 } = schemaProps;
        addImport(context, 'Col');
        appendCode(context, render, `<Col span={${24 * colspan / col}}>`);
        increaseSpaceOffset(context);
        const noButtonChild = children.every(({ component }) => { return component !== 'Button'; }); // 没有button作为FormItem的子组件
        const propsQueue = patchProps(context, only(schemaProps, noButtonChild ? ['label', 'style'] : ['style']));
        appendCode(context, render, `<Form.Item${children.length > 0 ? addPropsToCode(context, propsQueue) : ''}>`);
        parseChildren(children, context, true);
        appendCode(context, render, `</Form.Item>`);
        decreaseSpaceOffset(context);
        appendCode(context, render, `</Col>`);
        afterParseComponent(context, config);
    },
    Input(context, config, inForm) {
        const render = beforeParseComponent(context, config);
        const { schemaProps, logicProps = {} } = config;
        addImport(context, 'Input');
        const propsQueue = patchProps(context, schemaProps);
        const logicQueue = patchLogic(context, logicProps);
        propsQueue.push(...logicQueue);
        formComponentRender(context, config, render, propsQueue, inForm, 'Input', logicProps?.isRender);
        afterParseComponent(context, config);
    },
}
function patchLogic(context, logicProps) {
    const logicQueue = [];
    if (!logicProps) {
        return logicQueue;
    }
    const { eventName, openModal, confirmText, disabled, eventType, requestApi } = logicProps;
    requestApi && context.requireApis.add(requestApi);
    let eventHandler;
    if (eventName) {
        eventHandler = getEventHandler(logicProps[eventName], eventType, openModal, requestApi);
    }
    if (disabled) {
        logicQueue.push(`disabled={(() => {${getBody(deleteExpSpace(disabled))}})()}`);
    }
    if (!confirmText && eventHandler) {
        logicQueue.push(`${eventName}=${eventHandler}`);
    }
    return logicQueue;
}
function formComponentRender(context, config, render, propsQueue, inForm, component, isRender, selfClose = true) {
    if (inForm) {
        const { schemaProps } = config;
        wrapFieldDecorator(context, render, schemaProps || {});
        increaseSpaceOffset(context);
        increaseSpaceOffset(context);
        appendCode(context, render, `<${component} ${addPropsToCode(context, propsQueue)}/>`);
        decreaseSpaceOffset(context);
        appendCode(context, render, `)}`);
        decreaseSpaceOffset(context);
        appendCode(context, render, '</Form.Item>');
        // }
    } else {
        appendCode(context, render, `${getRenderCondition(isRender)}<${component} ${addPropsToCode(context, propsQueue)}${selfClose ? ' /': ''}>`);
    }
}
function getDefaultImports() {
    const defaultImports = [{
        packageName: 'react',
        defaultImport: 'React',
        namedImport: [],
    }, {
        packageName: 'antd',
        namedImport: [],
    }];
    return defaultImports;
}

function parseRenderModal(context) {
    const { pageModalQueue, modalConfig } = context;
    if (!modalConfig && pageModalQueue.length > 0) {
        context.spaceOffset = 3;
        const nameSpace = getNamespace(context);
        addStateToContext(context, `modalProps`, `{}`);
        // 添加state中对弹窗的状态控制
        pageModalQueue.forEach(({ name, onOkCallBackRequestApi }) => {
            const render = beforeParseComponent(context);
            appendCode(context, render, `<${name}`);
            increaseSpaceOffset(context);
            appendCode(context, render, `onClose={this.onClose${name}}`);
            appendCode(context, render, `dispatch={this.props.dispatch}`);
            appendCode(context, render, `modalProps={this.state.modalProps}`);
            appendCode(context, render, `visible={this.state.${name}Visible}`);
            appendCode(context, render, `${nameSpace}={this.props.${nameSpace}}`);
            decreaseSpaceOffset(context);
            appendCode(context, render, `/>`);

            addImport(context, name, `./${name}`, true);
            addStateToContext(context, `modalProps`, null);
            addStateToContext(context, `${name}Visible`, false);
            const bodyQueue = [];
            const callBackApiObj = getApiById(context, onOkCallBackRequestApi);
            if (callBackApiObj) { // 关闭弹窗后需要执行回调api
                context.requireApis.add(onOkCallBackRequestApi);
                bodyQueue.push(`isOk && this.${callBackApiObj.alias}();`);
            }
            bodyQueue.push(`this.setState({`);
            bodyQueue.push(`${context.spaceUnit}${name}Visible: false`);
            bodyQueue.push(`});`);
            addMethodToContext(context, `onClose${name}`, `e${callBackApiObj ? ', isOk = false' : ''}`, `${bodyQueue.join('\n')}`);
        });
    }
}
function parseApiMethod(context) {
    const { pageApiQueue, requireApis } = context;
    const ns = getNamespace(context);
    if (requireApis.size > 0) {
        if (context.exports.wrapForm) { // 有Form
            // bodyQueue.push(`const fieldsValue = this.props.form.getFieldsValue();`);
        }
        pageApiQueue
        .filter(({ uid }) => {
            return requireApis.has(uid);
        })
        .forEach((apiItem) => {
            const bodyQueue = [`const payload = Object.assign({}, values);`];
            const { alias, triggerLifeCycle } = apiItem;
            if (triggerLifeCycle) { // 需要在生命周期函数中执行该API，目前只支持componentDidMount
                const lifeCycle = ensureLifeCycle(context, triggerLifeCycle);
                lifeCycle.dynamics.push(`${addSpaces(context, 2)}this.${alias}();\n`); 
            }
            const payloadStr = getPayload(context, apiItem);
            bodyQueue.push(`this.props.dispatch({ \n${addSpaces(context, 1)}type: '${ns}/${alias}', \n${addSpaces(context, 1)}payload: ${payloadStr || 'payload'}\n});`);
            addMethodToContext(context, `${alias}`, 'values = {}', `${bodyQueue.join('\n')}`);
        });
    }
}
function parseRoot(context) {
    parseChildren(context.rootConfigs.children, context);
    parseApiMethod(context);
    parseRenderModal(context);
    return context;
}
function viewHelper(context, fileKey) {
    context.helpers = helpers;
    context.imports = getDefaultImports();
    if (fileKey !== 'index') { // modal文件
        const modalConfig = context.pageModalQueue.find(({ uid }) => {
            return uid == fileKey;
        });
        if (!modalConfig) {
            return context;
        }
        context.modalConfig = modalConfig;
        context.rootConfigs = modalConfig.rootConfigs || [];
    } else {
        addImport(context, 'connect', 'dva', false);
    }
    return compose(gernerate, parseRoot)(context);
}
function gernerate(context) {
    context.spaceOffset = 1;
    gerImports(context);
    gerFileStart(context);
    gerConstructor(context);
    gerCustomMethods(context);
    gerLifeCycles(context);
    gerFileEnd(context);
    return context;
}
function gerImports(context) {
    const { imports } = context;
    context.sourceCode = imports.reduce((importStr, { packageName, namedImport, defaultImport }) => {
        const importQueue = [];
        if (defaultImport) {
            importQueue.push(defaultImport);
        }
        if (namedImport.length > 0) {
            importQueue.push('{');
            namedImport.forEach((a, i) => {
                importQueue.push(`${a}${i === namedImport.length - 1 ? '' : ','}`);
            });
            importQueue.push('}');
        }
        if (importQueue.length > 0) {
            importStr += `import ${importQueue.join(' ')} from '${packageName}';\n`;
        }
        return importStr;
    }, ``);
    context.sourceCode += `\n`;
}
function gerFileStart(context) {
    const pageName = getPageName(context);
    const nameSpace = getNamespace(context);
    context.sourceCode += `${!context.modalConfig ? `@connect(state => { return { ${nameSpace}: state.${nameSpace}}; })\n` : ''}class ${pageName} extends React.PureComponent {\n`;
}
function gerConstructor(context) {
    const { state } = context;
    const stateKeys = Object.keys(state);
    if (stateKeys.length > 0) {
        const spaces = addSpaces(context, 1);
        const stateSpaces = addSpaces(context, 3);
        context.sourceCode += `${spaces}constructor(props) {
        super(props);
        this.state = {\n${stateKeys.reduce((str, stateKey) => {return (str += `${stateSpaces}${state[stateKey]}\n`);}, ``).slice(0, -1)}
        };
    }\n`;
    }
}
function gerCustomMethods(context) {
    const { customMethods } = context;
    context.sourceCode = Object.keys(customMethods).reduce((sourceCode, key) => {
        sourceCode += customMethods[key];
        return sourceCode;
    }, context.sourceCode);
}
function gerLifeCycles(context) {
    const { lifeCycles } = context;
    Object.entries(lifeCycles).forEach(([method, { dynamics, source }]) => {
        const methodSpaces = addSpaces(context); // 一个tab
        const methodBodySpaces = addSpaces(context, 2);
        const dynamicsCode = dynamics.length > 0 ? `\n${dynamics.join('')}` : '\n';
        if(method === 'render') {
            context.sourceCode += [
                methodSpaces,
                `${method}() {`,
                dynamicsCode,
                methodBodySpaces,
                'return (',
                source,
                `${methodSpaces}${methodBodySpaces}</${context.modalConfig ? 'Modal' : 'div'}>\n`,
                `${methodBodySpaces});\n${methodSpaces}}\n`
            ].join('');
        } else {
            context.sourceCode += [
                methodSpaces,
                `${method}() {`,
                dynamicsCode,
                // methodBodySpaces,
                // source,
                `${methodSpaces}}\n`
            ].join('');
        }
    })
}
function gerFileEnd(context) {
    const pageName = getPageName(context);
    if (context.exports.wrapForm) {
        context.sourceCode += `}\n\nexport default Form.create()(${pageName});\n`;
    } else {
        context.sourceCode += `}\n\nexport default ${pageName};\n`;
    }
}
function getNamespace(context, lowerCase = true) {
    const namespace = context?.pageConfig?.pageName || 'Anonymous';
    if (lowerCase) {
        return lowerCaseFirstLetter(namespace);
    }
    return namespace;
}
function getPageName(context) {
    if (context.modalConfig) {
        return context.modalConfig.name;
    }
    return getNamespace(context, false);
}
export default viewHelper;