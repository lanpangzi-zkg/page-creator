import { Input, Select, Switch, InputNumber, Form } from 'antd';
import React from 'react';
import execute from '../../Renderer/compile';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

const separator = '#';

function renderEditItemInner(editPropObj, context) {
    const { type, options, placeholder = '', min = 0, max = 99999, transformData } = editPropObj;
    if (type === 'Select') {
        let _options = options;
        if (typeof options === 'string') { // 是js表达式，数据源需要动态获取
            _options = execute(context, null, options) || [];
        }
        return (
            <Select allowClear>
                {
                    _options.map((option) => {
                        const transformer = transformData ? (data) => execute(data, null, transformData) : data => data;
                        const { value, label } = transformer(typeof option === 'object' ? option : { value: option, label: option });
                        return (
                            <Option key={value} value={value}>{label}</Option>
                        );
                    })
                }
            </Select>
        );
    }
    if  (type === 'Boolean') {
        return (<Switch />);
    }
    if (type === 'Number') {
        return (<InputNumber min={min} max={max} />);
    }
    if (type === 'TextArea') {
        return (<TextArea placeholder={placeholder} rows={4} />);
    }
    return (<Input placeholder={placeholder} allowClear />);
}

function getFormItemLayout(label, parentKey) {
    if (parentKey) {
        return {
            labelCol: {
                span: label?.length < 5 ? 6 : 8,
            },
            wrapperCol: {
                span:  label?.length < 5 ? 18 : 16,
            },
        };
    }
    return {};
}

function renderEditItemWithoutChildren(propKey, editPropObj, context, parentKey = '', pFormItemLayout) {
    const { props } = context;
    const { form } = props;
    const { getFieldDecorator } = form;
    const { label, value, rules = [], isRender, type, reactive, subEditProps } = editPropObj;
    if (isRender) { // 有渲染前置条件，例如configs.component === 'Button'
        const isRenderComponent = execute(context, null, isRender);
        if (!isRenderComponent) {
            return null;
        }
    }
    if (subEditProps) {
        const { formItemLayout, ...rest } = subEditProps;
        return (
            <Item
                label={label}
                key={propKey}
                {...(pFormItemLayout || getFormItemLayout(label, parentKey))}
            >
                <div style={{ height: 20 }}></div>
                {
                    Object.keys(rest).map((k) => {
                        return (
                            renderEditItemWithoutChildren(k, rest[k], context, `${parentKey}${separator}${propKey}`, formItemLayout)
                        );
                    })
                }
            </Item>
        );
    }
    const options = {
        rules,
    };
    if (value !== Infinity || value != null) { // 默认值正无穷大则表示没有默认值
        options.initialValue = value;
    }
    if (type === 'Boolean') { // 渲染Switch组件，初始值需要特殊处理
        options.valuePropName = 'checked';
    }
    const uniqueId = parentKey ? `${parentKey}${separator}${propKey}` : propKey;
    let renderResult = (
        <Item
            colon
            label={label}
            key={uniqueId}
            {...(pFormItemLayout || getFormItemLayout(label, parentKey))}
        >
            {getFieldDecorator(uniqueId, options)(renderEditItemInner(editPropObj, context))}
        </Item>
    );
    if (reactive) { // 有关联的表单项
        renderResult = [renderResult];
        Object.keys(reactive).forEach((reactiveKey) => {
            let reactiveQueue = reactive[reactiveKey];
            if (!Array.isArray(reactiveQueue)) {
                reactiveQueue = [reactive[reactiveKey]];
            }
            reactiveQueue.forEach((reactiveItem) => {
                const reactiveResult = renderEditItemWithoutChildren(reactiveItem.key, reactiveItem, context);
                if (Array.isArray(reactiveResult)) {
                    renderResult.push(...reactiveResult);
                } else {
                    renderResult.push(reactiveResult);
                }
            });
        });
    }
    return renderResult;
}

export {
    renderEditItemInner,
    renderEditItemWithoutChildren,
}