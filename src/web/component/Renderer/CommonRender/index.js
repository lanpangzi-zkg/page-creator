import React, { PureComponent } from 'react';
import ActionBar from '../ActionBar';
import AppContext from '../../../shared/AppContext';
import { reactiveClassName } from '../helper/PropsHelper';
import renderComponent, { renderTag, renderAtomComponent } from '../helper/RenderHelper';

const blockQueue = ['Divider'];
const eventNameRE = /on([A-Z]\w+)/;
class CommonRender extends PureComponent {
    /**
     * @desc 获取事件名称，去掉on前缀，例如onClick返回click
     * @returns string
     */
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
    getWrapperClassName() {
        const { configs, preview } = this.props;
        const { isContainer, component } = configs;
        const classNameQueue = ['action-bar-wrapper', reactiveClassName(preview)];
        if (blockQueue.includes(component) || isContainer) {
            classNameQueue.push('block');
        } else {
            classNameQueue.push('inline-block');
        }
        return classNameQueue.join(' ');
    }
    renderTopTag() {
        const { configs, preview, isAtom } = this.props;
        const { isContainer, name } = configs;
        if (!isContainer || isAtom) {
            return renderTag(name, preview, this.getEventTagName());
        }
        return null;
    }
    renderActionBar() {
        const { configs, preview, isAtom } = this.props;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        const { isContainer } = configs;
        if (!isContainer || isAtom) {
            return (
                <ActionBar
                    show={!preview}
                    onEdit={() => {
                        onShowPropsEditor(configs);
                    }}
                    onDelete={() => {
                        onDeleteConfig(configs);
                    }}
                />
            );
        }
        return null;
    }
    renderContent() {
        const { configs, preview, value, onChange, form } = this.props;
        const { isContainer } = configs;
        if(isContainer) {
            return renderComponent(configs, preview, { value, onChange });
        }
        return renderAtomComponent(configs, preview, { value, onChange, form });
    }
    render() {
        return (
            <div className={this.getWrapperClassName()}>
                {this.renderTopTag()}
                {this.renderContent()}
                {this.renderActionBar()}
            </div>
        );
    }
}

CommonRender.contextType = AppContext;

export default CommonRender;