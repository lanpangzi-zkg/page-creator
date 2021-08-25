import { appendCode, increaseSpaceOffset, decreaseSpaceOffset } from '../tool';

function serviceHelper(context) {
    const { pageApiQueue } = context;
    decreaseSpaceOffset(context);
    appendCode(context, `import axios from '../utils/axios';`);
    appendCode(context, ``);
    appendCode(context, `const { host } = window.configs;`);
    appendCode(context, ``);
    pageApiQueue.forEach(({ method, host, url, alias }) => {
        const _method = method.toLowerCase();
        appendCode(context, `export const ${alias} = (params) => {`);
        increaseSpaceOffset(context);
        appendCode(context, `return axios.${_method}(host.${host} + '${url}', ${ _method === 'get' ? `{ params }` : 'params' });`);
        decreaseSpaceOffset(context);
        appendCode(context, `};`);
    });
    return context;
}

export default serviceHelper;