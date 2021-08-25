import React from 'react';
import ActionBar from '../ActionBar';
import Dropable from '../../Core/Dropable';
import AppContext from '../../../shared/AppContext';
import renderComponent from '../helper/RenderHelper';
import { reactiveClassName } from '../helper/PropsHelper';

class DropCell extends Dropable {
    constructor(props) {
        super(props);
        this.uid = 0;
        this.dropContainer = React.createRef();
        this.dropTargetClassName = `col-drop-${Date.now()}`;
        this.bindEventContext();
    }
    componentDidMount() {
        this.didMount();
    }
    componentWillUnmount() {
        this.beforeUnmount();
    }
    render() {
        const { children, preview } = this.props;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div
                ref={this.dropContainer}
                className={`${this.getClassName()} multiple drop-container`}
            >
                {
                    children.map((child) => {
                        return (
                            <div
                                key={child.uid}
                                style={{
                                    display: 'inline-block',
                                    width: 'initial',
                                    padding: '5px 0',
                                }}
                                className="dashed-box action-bar-wrapper"
                            >
                                {renderComponent(preview, child)}
                                <ActionBar
                                    show={!preview}
                                    onEdit={() => {
                                        onShowPropsEditor(child);
                                    }}
                                    onDelete={() => {
                                        onDeleteConfig(child);
                                    }}
                                />
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