import React from 'react';
import { Form } from 'antd';
import Dropable from '../../Core/Dropable';
import CommonRender from '../CommonRender';
import AppContext from '../../../shared/AppContext';
import renderComponent from '../helper/RenderHelper';
import getInitialValue, { initFormWrapEditProps } from '../helper/PropsHelper';
class DropCell extends Dropable {
    constructor(props) {
        super(props);
        this.uid = 0;
        this.bindEventContext();
        this.dropContainer = React.createRef();
        this.dropTargetClassName = `col-drop-${Date.now()}`;
    }
    componentDidMount() {
        this.didMount();
    }
    componentWillUnmount() {
        this.beforeUnmount();
    }
    renderContent(configs) {
        const { form, preview } = this.props;
        if (form && configs.canWrapFieldDecorator) {
            initFormWrapEditProps(configs);
            const { getFieldDecorator } = form;
            const { submitId, rules } = configs.schemaProps;
            return (
                <Form.Item>
                    {
                        getFieldDecorator(String(submitId), {
                            rules: rules || [],
                            initialValue: getInitialValue(configs),
                        })(
                            <CommonRender
                                preview={preview}
                                configs={configs}
                            />
                        )
                    }
                </Form.Item>
            );
        }
        return renderComponent(configs, preview);
    }
    render() {
        const { children } = this.props;
        return (
            <div
                ref={this.dropContainer}
                className={`${this.getClassName()} multiple drop-container`}
            >
                {
                    children.map((child) => {
                        if (child.canWrapFieldDecorator) {

                        }
                        return (
                            <div
                                key={child.uid}
                                style={{
                                    display: 'inline-block',
                                    width: 'initial',
                                    padding: '5px 0',
                                }}
                            >
                                {this.renderContent(child)}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
DropCell.contextType = AppContext;
export default DropCell;