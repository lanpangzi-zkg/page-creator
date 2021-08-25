import React from 'react';
import AppService from '../../../service/AppService';

const ServicesMatch = {
    AppService,
};

export default function Service(name) {
    return (Target) => {
        return (props) => {
            const newProps = Object.assign({}, props);
            if (Object.hasOwnProperty.call(ServicesMatch, name)) {
                const ServiceClass = ServicesMatch[name];
                if (typeof ServiceClass === 'function') {
                    newProps.service = new ServiceClass();
                }
            }
            return (<Target {...newProps} />);
        };
    };
}
