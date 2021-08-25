function createContext({ helpers, defaultImports, rootConfigs,  pageConfig, pageApiQueue, pageModalQueue }) {
    const context = {
        pageConfig,
        rootConfigs,
        pageApiQueue,
        pageModalQueue,
        exports: {},
        lifeCycles: {},
        requireApis: new Set(),
        customMethods: {},
        modalConfig: null,
        state: {},
        model: {
            keys: [],
            effects: {},
        },
        imports: defaultImports,
        walkStack: [],
        spaceOffset: 1,
        spaceUnit: `	`,
        sourceCode: ``,
        inlineSeparate: ``,
        helpers,
    };
    return context;
}

export default createContext;