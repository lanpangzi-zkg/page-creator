import React from 'react';
import { Icon, Row } from 'antd';
import ColRender from '../ColRender';
import ActionBar from '../ActionBar';
import { renderTag } from '../helper/RenderHelper';
import AppContext from '../../../shared/AppContext';
import { ColSchema } from '../../../schema';
import { reactiveClassName, filterValidProps } from '../helper/PropsHelper';
import './index.css';
class GridRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.uid = props.configs.children.length;
    }
    onAddCol = () => {
        const newColSchema = Object.assign({}, ColSchema);
        newColSchema.uid = this.uid++;
        newColSchema.return = this.props.configs;
        const { onUpdateRootConfigs } = this.context;
        onUpdateRootConfigs(newColSchema);
    }
    renderRow() {
        const { preview, configs, form } = this.props;
        const { children = [], schemaProps } = configs;
        return (
            <Row {...filterValidProps(schemaProps)}>
                {children.map((child) => {
                    if (!child.return) { // 初始化渲染时还没有和父节点建立联系
                        child.return = configs;
                    }
                    return (
                        <ColRender
                            form={form}
                            key={child.uid}
                            configs={child}
                            preview={preview}
                        />
                    );
                })}
            </Row>
        );
    }
    render() {
        const { preview, configs } = this.props;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div className={`action-bar-wrapper block grid-wrapper ${reactiveClassName(preview)}`}>
                {renderTag(configs.name, preview)}
                {this.renderRow()}
                <ActionBar
                    show={!preview}
                    onEdit={() => {
                        onShowPropsEditor(configs);
                    }}
                    onDelete={() => {
                        onDeleteConfig(configs);
                    }}
                >
                    <Icon
                        type="plus"
                        title="新增单元格"
                        onClick={this.onAddCol}
                        className="edit-icon icon-form"
                    />
                </ActionBar>
            </div>
        );
    }
}

GridRender.contextType = AppContext;

export default GridRender;