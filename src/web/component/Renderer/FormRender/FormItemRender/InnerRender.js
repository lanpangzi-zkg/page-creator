import { Form } from 'antd';
import React, { Component } from 'react';
import GridRender from '../../GridRender';
import CommonRender from '../../CommonRender';
import getInitialValue, { parseStyle, initFormWrapEditProps } from '../../helper/PropsHelper';

class innerRender extends Component {
	render() {
        const { configs, form, parentConfigs, preview } =this.props;
        const { schemaProps: { style } } = parentConfigs;
        const label = parentConfigs?.schemaProps?.label || '';
        const { getFieldDecorator } = form;
        if (!configs?.component) { // FormItem没有嵌套的子组件
            return null;
        }
        if (configs.canWrapFieldDecorator) {
            initFormWrapEditProps(configs);
            const { submitId, rules = [] } = configs.schemaProps;
            return (
                <Form.Item
                    label={label}
                    style={parseStyle(style)}
                >
                    {getFieldDecorator(String(submitId), {
                        rules: rules || [],
                        initialValue: getInitialValue(configs),
                    })(
                        <CommonRender
                            preview={preview}
                            configs={configs}
                        />
                    )}
                </Form.Item>
            );
        }
        if (configs.name === 'Grid') { // Grid容许嵌套在Form内部且可以显示Form.Item的label
            return (
                <Form.Item
                    label={label}
                    style={parseStyle(style)}
                >
                    <GridRender
                        form={form}
                        preview={preview}
                        configs={configs}
                    />
                </Form.Item>
            );
        }
        return (
            <CommonRender
                preview={preview}
                configs={configs}
            />
        );
	}
}

export default innerRender;