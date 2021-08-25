import React from 'react';
import AtomRender from "../AtomRender";
import FormRender from '../FormRender';
import GridRender from '../GridRender';
import TabsRender from '../TabsRender';
import TableRender from "../TableRender";
import ModalRender from '../ModalRender';
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

const renderComponent = (preview, { name, schemaProps, logicProps }, formInjectProps = {}) => {
    const rawProps = Object.keys(schemaProps).reduce((obj, k) => {
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
    };
    switch(name) {
        case 'Modal':
            return <ModalRender {...props} />;
        case 'RadioGroup':
            return <RenderRadioGroup {...props} formInjectProps={formInjectProps} />;
        case 'Button':
            return <RenderButton {...props} />;
        case 'Divider':
            return <RenderDivider {...props} />;
        case 'Input':
            return <RenderInput {...props} formInjectProps={formInjectProps} />;
        case 'Label':
            return <RenderLabel {...props} />;
        case 'Select':
            return <RenderSelect {...props} formInjectProps={formInjectProps} />;
        case 'Checkbox':
            return <RenderCheckbox {...props} formInjectProps={formInjectProps} />;
        case 'DatePicker':
            return <RenderDatePicker {...props} formInjectProps={formInjectProps} />
        case 'Icon':
            return <RenderIcon {...props} />;
        case 'Breadcrumb':
            return <RenderBreadcrumb {...props} />;
    }
};

function renderPageComponent(configs, preview) {
    const props = {
        preview,
        configs,
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
            return <AtomRender key={uid} {...props} />;
    }
}
function renderStage(rootConfigs, preview) {
    const { children = [] } = rootConfigs;
    if (children.length > 0) {
        return children.map((child) => {
            return renderPageComponent(child, preview);
        });
    }
    return (
        <div className="empty-tips">
            <span>+ 请拖拽组件</span>
        </div>
    );
}

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
                lineHeight: 1.2,
                fontSize: '12px',
                width: 'initial',
                position: 'absolute',
            }}
        >
            <span
                style={{
                    background: '#bbbbbb',
                    padding: '0 2px',
                    borderRadius: '3px',
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
    parseStyle,
    renderTag,
    renderStage,
    renderPageComponent,
};