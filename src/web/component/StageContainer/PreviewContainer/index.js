import React from 'react';
import { renderStage, parseStyle } from '../../Renderer/helper/RenderHelper';
import { executeRequestApi } from '../helper';
import './index.css';

class PreviewContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            apiData: {},
            pageIndex: 1,
            pageSize: 10,
            activeModal: null,
            fetchLoading: false,
        };
        this.apiFormMap = props.apiFormMap;
    }
    executeRequestApi(...args) {
        executeRequestApi(this, ...args);
    }
    executeApiOnLifeCycle(lifeCycle = 'componentDidMount') {
        const { pageApiQueue } = this.props;
        pageApiQueue.filter((apiItem) => {
            return apiItem.triggerLifeCycle === lifeCycle;
        }).forEach((apiItem) => {
            this.executeRequestApi(apiItem.uid);
        });
    }
    componentDidMount() {
        this.executeApiOnLifeCycle();
    }
    componentDidUpdate() {
        this.executeApiOnLifeCycle('componentDidUpdate');
    }
    render() {
        const { rootConfigs, pageConfig } = this.props;
        return (
            <div
                className="preview-container"
                style={parseStyle(pageConfig?.style) || {}}
            >
                {renderStage(rootConfigs, true)}
            </div>
        );
    }
}

export default PreviewContainer;