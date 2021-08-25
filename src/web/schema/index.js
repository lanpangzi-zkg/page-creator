import Col from './Col';
import Grid from './Grid';
import Form from './Form';
import Icon from './Icon';
import Tabs from './Tabs';
import Input from './Input';
import Table from './Table';
import Label from './Label';
import Button from './Button';
import Select from './Select';
import Divider from './Divider';
import Checkbox from './Checkbox';
import FormItem from './FormItem';
import RadioGroup from './RadioGroup';
import Breadcrumb from './Breadcrumb';
import DatePicker from './DatePicker';
import patchSchemaProps from './patchSchemaProps';

export default {
    atomComponent: { // 原子组件，不能作为容器组件包含其他组件
        Input: patchSchemaProps(Input),
        Button: patchSchemaProps(Button),
        Label: patchSchemaProps(Label),
        Select: patchSchemaProps(Select),
        Checkbox: patchSchemaProps(Checkbox),
        RadioGroup: patchSchemaProps(RadioGroup),
        DatePicker: patchSchemaProps(DatePicker),
        Divider: patchSchemaProps(Divider),
        Icon: patchSchemaProps(Icon),
        // Tabs: patchSchemaProps(Tabs),
        Breadcrumb: patchSchemaProps(Breadcrumb),
    },
    container: { // 容器组件
        Grid: patchSchemaProps(Grid),
        Form: patchSchemaProps(Form),
        Table: patchSchemaProps(Table),
    },
};

const ColSchema = patchSchemaProps(Col);
const FormItemSchema = patchSchemaProps(FormItem);

export {
    ColSchema,
    FormItemSchema,
    patchSchemaProps,
};