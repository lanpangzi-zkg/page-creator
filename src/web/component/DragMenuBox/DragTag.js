/**
 * @desc 可拖拽组件标签
 */
import React, { PureComponent } from 'react';
import { GROUP_TEMPLATE_PAGE } from '../../utils/Constants';

class DragTag extends PureComponent {
	onDragStart(e, schema) {
		const { groupType } = this.props;
		const transferData = groupType === GROUP_TEMPLATE_PAGE ? { rootConfigs: schema, groupType } : schema;
		e.dataTransfer.setData('text/plain',JSON.stringify(transferData));
	}
	render() {
		const { schema } = this.props;
		return (
			<span
				draggable="true"
				className="drag-item"
				onDragStart={(e) => { this.onDragStart(e, schema); }}
			>
				{schema.name}
			</span>
		);
	}
}

export default DragTag;