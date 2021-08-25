import React from 'react';
import { Col } from 'antd';
import DropCell from './DropCell';
import ActionBar from '../ActionBar';
import AppContext from '../../../shared/AppContext';
import { reactiveClassName, filterValidProps } from '../helper/PropsHelper';
import './index.css';

class ColRender extends React.PureComponent {
    render() {
        const { preview, configs } = this.props;
        const { schemaProps, children = [] } = configs;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <Col {...filterValidProps(schemaProps)}>
                <div className={`action-bar-wrapper ${reactiveClassName(preview)}`}>
                    <DropCell
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