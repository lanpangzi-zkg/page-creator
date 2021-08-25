import React from 'react';
import InnerRender from './InnerRender';
import ActionBar from '../../ActionBar';
import Dropable from '../../../Core/Dropable';
import AppContext from '../../../../shared/AppContext';
import { reactiveClassName } from '../../helper/PropsHelper';
import './index.css';

const forbiddenDropComponents = ['Breadcrumb', 'Text', 'Tabs'];

class FormItemRender extends Dropable {
    constructor(props) {
        super(props);
        this.uid = 0;
        this.dropContainer = React.createRef();
        this.forbiddenDropComponents = forbiddenDropComponents;
        this.dropTargetClassName = `form-item-drop-${Date.now()}`;
        this.bindEventContext();
    }
    componentDidMount() {
        this.didMount();
    }
    componentWillUnmount() {
        this.beforeUnmount();
    }
    getContainerWidth(span = 8) {
        return `${100 * span / 24 }%`;
    }
    render() {
        const { col, configs, preview } = this.props;
        const { children, schemaProps } = configs;
        const span = 24 * (Math.min(schemaProps.colspan || 1, col)) / col;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div
                ref={this.dropContainer}
                style={{width: this.getContainerWidth(span)}}
                className={`${this.dropTargetClassName} drop-container ${reactiveClassName(preview)}`}
            >
                <InnerRender
                    {...this.props}
                    span={span}
                    parentConfigs={configs}
                    configs={children && children[0]}
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
        );
    }
}
FormItemRender.contextType = AppContext;
export default FormItemRender;