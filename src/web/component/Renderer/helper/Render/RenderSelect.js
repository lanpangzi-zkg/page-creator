import React from 'react';
import { Select } from 'antd';
import BaseRender from './BaseRender';

const { Option } = Select;

class RenderSelect extends BaseRender {
    isChildProps(propKey) {
        return propKey === 'children';
    }
    render() {
        const { global } = this.context;
        const { rawProps, logicProps = {} } = this.props;
        const { children = [] } = rawProps;
        const { requestApi, apiDataTransform } = logicProps;
        let options = children;
        // 下拉数据从接口获取
        if (requestApi) {
            const target = global.state.pageApiQueue.find(({ uid }) => {
                return uid === requestApi;
            });
            if (Array.isArray(global.state.apiData[target.modelKey])) {
                let mapFn = (data) => data;
                if (apiDataTransform) {
                    mapFn = new Function(`data`, `${apiDataTransform.includes('return' ? '' : 'return ')}${apiDataTransform};`);
                }
                options = global.state.apiData[target.modelKey].map((item) => {
                    return mapFn(item);
                });
            }
        }
        const componentProps = this.getComponentProps();
        return (
            this.isRenderComponent() &&
            <Select {...componentProps}>
                {
                    options.map(({ value, label, uid }) => {
                        return (
                            <Option value={value} key={uid || value}>{label}</Option>
                        );
                    })
                }
            </Select>
        );
    }
}

export default RenderSelect;