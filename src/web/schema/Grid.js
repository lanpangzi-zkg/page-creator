import patchSchemaProps from './patchSchemaProps';
import Col from './Col';

const _Col = patchSchemaProps(Col);

export default {
    name: 'Grid',
    component: 'Row',
    isContainer: true,
    editProps: {
        align: {
            label: 'align',
            type: 'Select',
            options: ['top', 'middle', 'bottom'],
        },
        gutter: {
            label: 'gutter',
            type: 'Input',
        },
        justify: {
            label: 'justify',
            type: 'Select',
            options: ['start', 'end', 'center', 'space-around', 'space-between'],
        }
    },
    children: [{
        uid: 0,
        ..._Col,
    }, {
        uid: 1,
        ..._Col,
    }, {
        uid: 2,
        ..._Col,
    }],
};