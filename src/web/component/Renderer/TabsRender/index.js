import React from 'react';
import { Tabs } from 'antd';
import ActionBar from '../ActionBar';
import { renderTag } from '../helper/RenderHelper';
import AppContext from '../../../shared/AppContext';
import { reactiveClassName } from '../helper/PropsHelper';
import './index.css';

const { TabPane } = Tabs;

class TabsRender extends React.PureComponent {
    render() {
        const { preview, configs } = this.props;
        const { schemaProps, logicProps } = configs;
        const { children = [], ...rest } = schemaProps;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div className={`tabs-container block action-bar-wrapper ${reactiveClassName(preview)}`}>
                {renderTag(configs.name, preview)}
                {children.length > 0 && <Tabs {...rest}>
                    {
                        children.map(({ tab, key }) => {
                            return (
                                <TabPane tab={tab} key={key}>
                                </TabPane>
                            );
                        })
                    }
                </Tabs>}
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

TabsRender.contextType = AppContext;

export default TabsRender;
