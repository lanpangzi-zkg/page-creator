import { message } from "antd";
import { DELETE, UPDATE } from "../../shared/Tag";

function updateRootConfigs(context, childConfig, effectTag) {
    const { rootConfigs } = context.state;
    const parentConfig = childConfig.return || rootConfigs;
    const locIndex = (parentConfig.children = parentConfig.children || []).findIndex((item) => {
        return item.uid == childConfig.uid;
    });
    const { children } = parentConfig;
    if (locIndex < 0) {
        children.push(childConfig);
    } else {
        if (effectTag == DELETE) {
            children.splice(locIndex, 1);
        } else {
            children[locIndex] = Object.assign(children[locIndex], childConfig);
        }
    }
    // 每次都触发新的渲染
    context.setState({
        rootConfigs: Object.assign({}, rootConfigs),
    });
}

function showPropsEditor(context, editSchema) {
    context.setState({
        editSchema,
        showPropsEditor: true,
    });
}
function hidePropsEditor(context, _, newConfigs) {
    context.setState({
        showPropsEditor: false,
        editSchema: null,
    });
    if (newConfigs) {
        context.onUpdateRootConfigs(newConfigs, UPDATE);
    }
}

function loadConfigsScript(host) {
    const url = new URL(host);
    const script = document.createElement('script');
    const src = `${url.origin}/resources/js/configs.js?v=${Date.now()}`;
    script.src = src;
    script.onerror = (err) => {
        message.error(`加载\`${src}\`异常:${err.message}`);
    };
    document.body.appendChild(script);
}

const apiParamMapRE = /(\w+)[ \n\r\t\f]*(:\w+)?[ \n\r\t\f]*(?:=[ \n\r\t\f]*([\S]+))?/;
const formRE = /getFieldValue\(('|")(\w+)\1\)/;
const stateRE = /state\.([\w_.]+)/;

function getValueFromContext(context, apiId, exp) {
    let match = exp?.match(formRE);
    if (match) { // 参数来自form表单
        context.apiFormMap[apiId]?.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
        return context.apiFormMap[apiId]?.getFieldValue(match[2]);
    }
    match = exp.match(stateRE);
    if (match) { // 参数来自state
        return context.state[match[1]];
    }
    return exp;
}

function tranformValueType(value, type) {
    switch(type?.toLowerCase()) {
        case 'number':
            return Number(value);
        case 'boolean':
            return Boolean(value);
        default:
            return value;
    }
}
/**
 * @desc 创建接口请求参数对象
 * @param {*} context 
 * @param {*} paramsMapStr 
 * @returns 
 */
function createRequestParams(context, apiId, paramsMapStr, reqParams) {
    const params = {};
    if (paramsMapStr) {
        return paramsMapStr.split(',').map((s) => s.trim()).reduce((obj, item) => {
            const match = item.match(apiParamMapRE);
            if (match) {
                const [_, paramKey, paramType, mapExp] = match; // 'a:number = 123' => ["a:number = 123", "a", ":number", "123"]
                if (reqParams?.hasOwnProperty(paramKey)) { // 参数有来自外部传递的对象(例如form提交的数据)
                    params[paramKey] = reqParams[paramKey]; // 需要处理数据转换，例如日期
                } else {
                    params[paramKey] = tranformValueType(getValueFromContext(context, apiId, mapExp), paramType?.slice(1));
                }
            }
            return obj;
        }, params);
    }
    return Object.assign(params, reqParams);
}
/**
 * @desc 统一执行接口调用方法
 * @param {*} context 
 * @param {*} apiId 
 * @returns 
 */
function executeRequestApi(context, apiId, reqParams) {
    const pageApiQueue = context.props.pageApiQueue || context.state.pageApiQueue;
    const apiObj = pageApiQueue.find(({ uid }) => {
        return apiId === uid;
    });
    if (!apiObj) {
        message.warn("api未找到，请检查是否已删除");
        return;
    }
    const {
        url,
        host,
        method,
        modelKey,
        paramsMap, /*接口入参映射关系*/
        isPagination,
    } = apiObj;
    const requestParams = createRequestParams(context, apiId, paramsMap, reqParams);
    toggleLoading(context);
    // 分页查询接口
    if (isPagination) {
        const { paginationParamsMap } = apiObj;
        const [ps, pi] = paginationParamsMap.trim()
        .split(',')
        .map((s) => s.trim());
        const { pageSize, pageIndex } = context.state;
        requestParams[ps] = pageSize;
        requestParams[pi] = pageIndex;
    }
    return context.props.service
    .requestApi(host, method, url, requestParams)
    .then((res = {}) => {
        const { data } = res;
        if (res.status === 200) {
            const { code, message: msg, data: realData } = data || {};
            if (code != 0) {
                message.error(msg || "调用接口异常");
            } else if (modelKey) {
                const { apiData } = context.state;
                const newApiData = Object.assign({}, apiData);
                if (isPagination) {
                    newApiData[modelKey] = Array.isArray(realData) ? realData: realData?.list;
                    newApiData[`${modelKey}Total`] = realData?.total || 0;
                } else {
                    newApiData[modelKey] = realData;
                }
                context.setState({
                    apiData: newApiData,
                });
            }
        } else {
            const { message: msg } = data || {};
            message.error(msg || "调用接口异常");
        }
        toggleLoading(context, false);
        return Promise.resolve(res);
    })
    .catch((error) => {
        toggleLoading(context, false);
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                message.error("登录信息过期，请重新登录");
            } else if (status === 403) {
                message.error(error.response.data.message);
            } else if (status === 404) {
                message.error("接口地址404");
            }
        } else {
            message.error(JSON.stringify(error));
        }
        return Promise.reject(error);
    });
}
function toggleLoading(context, fetchLoading = true) {
    context.setState({
        fetchLoading,
    });
}
export default updateRootConfigs;
export {
    formRE,
    stateRE,
    apiParamMapRE,
    showPropsEditor,
    hidePropsEditor,
    loadConfigsScript,
    executeRequestApi,
    createRequestParams,
}