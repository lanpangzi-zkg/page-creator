
import createContext from './Context';
import modelHelper from './helpers/model';
import serviceHelper from './helpers/service';
import viewHelper from './helpers/view';

function createCode(rootConfigs, pageConfig, pageApiQueue, pageModalQueue, fileKey) {
    const context = createContext({ rootConfigs, pageConfig, pageApiQueue, pageModalQueue });
    let createFn;
    switch (fileKey) {
        case 'model':
            createFn = modelHelper;
            break;
        case 'service':
            createFn = serviceHelper;
            break;
        case 'index':
        default: // modal
            createFn = viewHelper;
            break;
    }
    if (createFn) {
        return createFn(context, fileKey).sourceCode;
    }
    return '';
}

export default createCode;