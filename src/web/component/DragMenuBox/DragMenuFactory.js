/**
 * @desc 根据组件分类渲染组件标签到左侧组件栏
 */
import React, { Fragment } from 'react';
import DragTag from './DragTag';
import schema from '../../schema';

function getGroupSchema(props) {
	const { groupType } = props;
	const groupSchema = schema[groupType];
	return Array.isArray(groupSchema) ? groupSchema : Object.entries(groupSchema).reduce((arr, [_, v]) => {
		arr.push(v);
		return arr;
	}, [])
}

function DragMenuFactory(props) {
	const { groupType } = props;
	return (
		<Fragment>
			{
				getGroupSchema(props).map((schemaItem) => {
					const { name } = schemaItem;
					return (
						<DragTag
							key={name}
							schema={schemaItem}
							groupType={groupType}
						/>
					);
				})
			}
		</Fragment>
	);
}

export default DragMenuFactory;