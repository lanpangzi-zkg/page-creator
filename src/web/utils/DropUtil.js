const initDropData = (dragData, context, isFormItem = false) => {
    const { dropComponent } = context.state;
    const { configs } = context.props;
    const { type, ...defaultConfigs } = dragData;
    let newConfigs = {
        textAlign: 'left',
    };
    if (dropComponent) {
        if (type === 'Button' && configs.type === 'Button') {
            newConfigs = Object.assign({}, configs);
            newConfigs.buttonArr.push({
                btnIndex: context.btnIndex,
                ...defaultConfigs,
            });
            context.btnIndex += 1;
        } else {
            return;
        }
    } else {
        if (type === 'Button') {
            newConfigs.buttonArr = [{
                btnIndex: context.btnIndex,
                ...defaultConfigs,
            }];
            context.btnIndex += 1;
        } else {
            newConfigs = { ...defaultConfigs };
        }
        newConfigs.type = type;
    }
    if (isFormItem && newConfigs.type !== 'Button') {
        const { configs } = context.props;
        const { originSpan, cellStyles, colIndex, colSpan } = configs;
        newConfigs.originSpan = originSpan;
        newConfigs.cellStyles = cellStyles;
        newConfigs.colIndex = colIndex;
        newConfigs.colSpan = colSpan;
        newConfigs.label = type;
        newConfigs.name = `name-${colIndex}`;
    }
    return newConfigs;
};

export default initDropData;