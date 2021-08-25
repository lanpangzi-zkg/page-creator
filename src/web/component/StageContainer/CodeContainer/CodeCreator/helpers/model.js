import addSpaces, { appendCode, increaseSpaceOffset, decreaseSpaceOffset, lowerCaseFirstLetter } from '../tool';

function pushCode(stack, code, spaces) {
    if (stack.length === 0) {
        stack.push(`${code}`);
        return;
    }
    stack.push(`${spaces}${code}`);
}

function modelHelper(context) {
    const { pageApiQueue, pageConfig } = context;
    const pageName = pageConfig?.pageName || 'Anonymous';
    decreaseSpaceOffset(context);
    appendCode(context, `import * as service from '../services/${pageName}';`);
    appendCode(context, ``);
    appendCode(context, `export default {`);
    increaseSpaceOffset(context);
    appendCode(context, `namespace: '${lowerCaseFirstLetter(pageName)}',`);
    appendCode(context, `state: {`);
    increaseSpaceOffset(context);
    const state = [];
    const effects = [];
    pageApiQueue.forEach(({ modelKey, alias, isPagination }, i) => {
        modelKey && pushCode(state, `${modelKey}: null`, addSpaces(context));
        if (isPagination && modelKey) {
            pushCode(state, `${modelKey}Total: 0`, addSpaces(context));
        }
        effects.push(`${i === 0 ? context.spaceUnit : addSpaces(context)}*${alias}({ payload }, { call${modelKey ? ', put' : ''} }) {`);
        increaseSpaceOffset(context);
        effects.push(`${addSpaces(context)}const result = yield call(service.${alias}, payload);`);
        if (modelKey) {
            if (isPagination) {
                effects.push(`${addSpaces(context)}const newStore = { ${modelKey}: result.data.list, ${modelKey}Total: result.data.total };`);
            } else {
                effects.push(`${addSpaces(context)}const newStore = { ${modelKey}: result.data };`);
            }
            effects.push(`${addSpaces(context)}yield put({`);
            increaseSpaceOffset(context);
            effects.push(`${addSpaces(context)}type: 'updateStore',`);
            effects.push(`${addSpaces(context)}payload: newStore`);
            decreaseSpaceOffset(context);
            effects.push(`${addSpaces(context)}});`);
        }
        effects.push(`${addSpaces(context)}return result;`);
        decreaseSpaceOffset(context);
        effects.push(`${addSpaces(context)}}${i === pageApiQueue.length - 1 ? '' : ','}`);
    });
    appendCode(context, state.join(',\n'));
    decreaseSpaceOffset(context);
    appendCode(context, `},`);
    appendCode(context, `effects: {`);
    appendCode(context, effects.join('\n'));
    appendCode(context, `},`);

    appendCode(context, `reducers: {`);
    const reducers = [];
    reducers.push(`${addSpaces(context)}updateStore(state, { payload }) {`);
    increaseSpaceOffset(context);
    increaseSpaceOffset(context);
    reducers.push(`${addSpaces(context)}return Object.assign({}, state, payload);`);
    decreaseSpaceOffset(context);
    reducers.push(`${addSpaces(context)}}`);
    decreaseSpaceOffset(context);
    appendCode(context, reducers.join('\n'));
    appendCode(context, `}`);
    decreaseSpaceOffset(context);

    appendCode(context, `};`);
    return context;
}

export default modelHelper;