import React from 'react';

class RenderLabel extends React.PureComponent {
    render() {
        const { rawProps } = this.props;
        const { label, ...rest } = rawProps;
        return (
            <span {...rest}>{label}</span>
        );
    }
}

export default RenderLabel;
