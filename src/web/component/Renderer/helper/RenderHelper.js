import React from 'react';
import FormRender from '../FormRender';
import GridRender from '../GridRender';
import TabsRender from '../TabsRender';
import TableRender from "../TableRender";
import ModalRender from '../ModalRender';
import CommonRender from '../CommonRender';
import { parseStyle } from './PropsHelper';
import RenderIcon from './Render/RenderIcon';
import RenderLabel from './Render/RenderLabel';
import RenderInput from './Render/RenderInput';
import RenderSelect from './Render/RenderSelect';
import RenderButton from './Render/RenderButton';
import RenderDivider from './Render/RenderDivider';
import RenderCheckbox from './Render/RenderCheckbox';
import RenderDatePicker from './Render/RenderDatePicker';
import RenderBreadcrumb from './Render/RenderBreadcrumb';
import RenderRadioGroup from './Render/RenderRadioGroup';

/**
 * @desc 渲染单个原子组件
 * @param {*} configs 
 * @param {*} preview 
 * @param {*} formInjectProps 
 * @returns 
 */
const renderAtomComponent = (configs, preview, formInjectProps = {}) => {
    const { uid, name, schemaProps = {}, logicProps, canWrapFieldDecorator } = configs;
    const rawProps = Object.keys(schemaProps).reduce((obj, k) => {
        if (k === 'submitId' || k === 'rules') {
            return obj;
        }
        // 过滤组件属性的空值
        if (Number.isInteger(schemaProps[k]) || !!schemaProps[k]) {
            obj[k] = schemaProps[k];
        }
        // style对象解析
        if (k === 'style') {
            obj.style = parseStyle(schemaProps[k]);
        }
        return obj;
    }, {});
    const props = {
        rawProps,
        preview,
        logicProps,
        key: uid,
    };
    if (canWrapFieldDecorator) {
        props.formInjectProps = formInjectProps;
    }
    switch(name) {
        case 'Modal':
            return <ModalRender {...props} />;
        case 'RadioGroup':
            return <RenderRadioGroup {...props} />;
        case 'Button':
            return <RenderButton {...props} />;
        case 'Divider':
            return <RenderDivider {...props} />;
        case 'Input':
            return <RenderInput {...props} />;
        case 'Label':
            return <RenderLabel {...props} />;
        case 'Select':
            return <RenderSelect {...props} />;
        case 'Checkbox':
            return <RenderCheckbox {...props} />;
        case 'DatePicker':
            return <RenderDatePicker {...props} />;
        case 'Icon':
            return <RenderIcon {...props} />;
        case 'Breadcrumb':
            return <RenderBreadcrumb {...props} />;
        default:
            return null;
    }
};
/**
 * @desc 渲染组件入口，渲染容器和原子组件
 * @param {*} configs 
 * @param {*} preview 
 * @param  {...any} rest 
 * @returns 
 */
function renderComponent(configs, preview, ...rest) {
    const props = {
        preview,
        configs,
        ...rest,
    };
    const { name, uid } = configs;
    switch(name) {
        case 'Form':
            return <FormRender key={uid} {...props} />;
        case 'Grid':
            return <GridRender key={uid} {...props} />;
        case 'Table':
            return <TableRender key={uid} {...props} />;
        case 'Tabs':
            return <TabsRender key={uid} {...props} />;
        default:
            return <CommonRender key={uid} {...props} isAtom />;
    }
}
/**
 * @desc 渲染舞台
 * @param {*} rootConfigs 
 * @param {*} preview 
 * @returns 
 */
function renderStage(rootConfigs, preview) {
    const { children = [] } = rootConfigs;
    if (children.length > 0) {
        return children.map((child) => {
            return renderComponent(child, preview);
        });
    }
    return (
        <div className="empty-tips">
            <span>+ 请拖拽组件</span>
        </div>
    );
}
/**
 * @desc 渲染组件左上角标签，目前支持【组件名称】和【API】两种标签
 * @param {*} componentName 
 * @param {*} preview 
 * @param {*} tagName 
 * @returns 
 */
function renderTag(componentName, preview, tagName) {
    if (preview) {
        return null;
    }
    return (
        <div
            style={{
                top: '0',
                left: '0',
                zIndex: 9,
                color: '#fff',
                lineHeight: 1,
                fontSize: '12px',
                width: 'initial',
                position: 'absolute',
            }}
        >
            <span
                style={{
                    background: '#cacaca',
                    padding: '0 2px',
                    borderRadius: '3px',
                    display: 'inline-block',
                }}
            >
                {componentName}
            </span>
            {
                tagName && 
                <span
                    style={{
                        background: '#35beff',
                        padding: '0 2px',
                        borderRadius: '3px',
                        marginLeft: '2px',
                        display: 'inline-block',
                    }}
                >
                    {tagName}
                </span>
            }
        </div>
    );
}

export default renderComponent;
export {
    renderTag,
    parseStyle,
    renderStage,
    renderAtomComponent,
};