import FormItem from './FormItem';
import { transformApiData } from './logic';
import patchSchemaProps from './patchSchemaProps';

const _FormItem = patchSchemaProps(FormItem);
const children = Array.apply(null, { length: 3 }).map((_, i) => {
    const formItem = Object.assign({}, _FormItem);
    const submitId = Math.floor(Math.random() * Math.pow(10, 10));
    formItem.schemaProps = Object.assign({}, formItem.schemaProps);
    formItem.editProps = Object.assign({}, formItem.editProps);
    formItem.schemaProps.submitId = submitId;
    formItem.editProps.submitId.value = submitId;
    return {
        uid: i,
        ...formItem,
    };
});

export default {
    name: 'Form',
    component: 'Form',
    isContainer: true,
    logicControll: {
        requestApi: {
            key: 'requestApi',
            label: '请求接口',
            type: 'Select',
            transformData: transformApiData,
            options: 'return this.props.pageApiQueue;',
        },
    },
    editProps: {
        layout: {
            label: 'layout',
            type: 'Select',
            value: 'horizontal',
            options: ['horizontal', 'vertical', 'inline'],
        },
        col: {
            label: '表单列数',
            type: 'Select',
            options: [1, 2, 3, 4],
            value: 3,
        },
        labelCol: {
            label: 'labelCol',
            subEditProps: {
                xs: {
                    label: 'xs',
                    subEditProps: {
                        span: {
                            label: 'span',
                            type: 'Number',
                        }
                    }
                },
                sm: {
                    label: 'sm',
                    subEditProps: {
                        span: {
                            label: 'span',
                            type: 'Number',
                        }
                    }
                }
            }
        },
        wrapperCol: {
            label: 'wrapperCol',
            subEditProps: {
                xs: {
                    label: 'xs',
                    subEditProps: {
                        span: {
                            label: 'span',
                            type: 'Number',
                        }
                    }
                },
                sm: {
                    label: 'sm',
                    subEditProps: {
                        span: {
                            label: 'span',
                            type: 'Number',
                        }
                    }
                }
            }
        },
        labelAlign: {
            label: 'labelAlign',
            type: 'Select',
            options: ['left', 'right'],
        },
        colon: {
            label: 'colon',
            type: 'Boolean',
            value: true,
        },
    },
    children,
};