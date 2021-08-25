import { Form, Col } from 'antd';
import React, { Component, Fragment } from 'react';
import AtomRender from '../../AtomRender';
import getInitialValue, { parseStyle } from '../../helper/PropsHelper';

class innerRender extends Component {
	render() {
        const { configs, form, span, parentConfigs, preview } =this.props;
        const { getFieldDecorator } = form;
        const { schemaProps: { submitId, uid, style, rules = [], required } } = parentConfigs;
        const label = parentConfigs?.schemaProps?.label || '';
        if (!configs?.component) { // FormItem没有嵌套的子组件
            // return (
            //     <Form.Item
            //         label={label}
            //         style={parseStyle(style)}
            //     />
            // );
            return null;
        }
        if (required) {
            rules.push({
                required: true, message: `请输入${label}`,
            });
        }
		return (
			<Fragment>
				<Col span={span}>
                    {
                        configs.component !== 'Button' ?
                            (
                                <Form.Item
                                    label={label}
                                    style={parseStyle(style)}
                                >
                                    {getFieldDecorator(String(submitId), {
                                        rules: rules || [],
                                        initialValue: getInitialValue(configs),
                                    })(
                                        <AtomRender preview={preview} configs={configs} />
                                    )}
                                </Form.Item>
                            ) : (
                                <Form.Item>
                                    {
                                        <AtomRender preview={preview} configs={configs} />
                                    }
                                </Form.Item>
                            )
                    }
			    </Col>
		    </Fragment>
	    );
	}
}

export default innerRender;