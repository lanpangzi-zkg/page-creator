import React from 'react';
import { Col } from 'antd';
import DropCell from './DropCell';
import ActionBar from '../ActionBar';
import { renderTag } from '../helper/RenderHelper';
import AppContext from '../../../shared/AppContext';
import { reactiveClassName, filterValidProps } from '../helper/PropsHelper';
import './index.css';

class ColRender extends React.PureComponent {
    render() {
        const { preview, configs, form } = this.props;
        const { schemaProps, children = [] } = configs;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <Col {...filterValidProps(schemaProps)}>
                <div className={`action-bar-wrapper ${reactiveClassName(preview)}`}>
                    {renderTag(configs.name, preview)}
                    <DropCell
                        form={form}
                        preview={preview}
                        parent={configs}
                        children={children}
                    />
                    <ActionBar
                        show={!preview}
                        onEdit={() => {
                            onShowPropsEditor(configs);
                        }}
                        onDelete={() => {
                            onDeleteConfig(configs);
                        }}
                        />
                </div>
            </Col>
        );
    }
}

ColRender.contextType = AppContext;

export default ColRender;