/**
 * @desc 根据editProps初始化schemaProps
 * @param {object} schema
 * @returns schema
 */
 function patchSchemaProps(schema) {
    const { editProps = {}, schemaProps = {} } = schema;
    schema.schemaProps = Object.assign(schemaProps, Object.keys(editProps).reduce((obj, k) => {
        if (k !== 'arrayTypeProps' && k !== 'childComponent') {
            obj[k] = editProps[k].value;
        }
        return obj;
    }, {}));
    return schema;
}

export default patchSchemaProps;