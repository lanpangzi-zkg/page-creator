import React, { PureComponent } from 'react';
import ActionBar from '../ActionBar';
import AppContext from '../../../shared/AppContext';
import renderComponent, { renderTag } from '../helper/RenderHelper';
import { reactiveClassName } from '../helper/PropsHelper';

const blockQueue = ['Divider'];
const eventNameRE = /on([A-Z]\w+)/;
class AtomRender extends PureComponent {
    getEventTagName() {
        const { configs } = this.props;
        if (configs?.logicProps?.eventType) {
            const eventName = configs?.logicProps?.eventName || '';
            const match = eventName.match(eventNameRE);
            if (match) {
                return match[1].toLowerCase();
            }
        }
        return '';
    }
    render() {
        const { configs, preview, value, onChange } = this.props;
        const isBlock = blockQueue.includes(configs.component)
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div className={`action-bar-wrapper ${isBlock ? 'block' : 'inline-block'} ${reactiveClassName(preview)}`}>
                {renderTag(configs.name, preview, this.getEventTagName())}
                {renderComponent(preview, configs, { value, onChange })}
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
        );;
    }
}

AtomRender.contextType = AppContext;

export default AtomRender;