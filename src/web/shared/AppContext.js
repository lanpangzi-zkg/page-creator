import React from 'react';

const AppContext = React.createContext({
    global: {},
    preview: false,
    onDeleteConfig: () => {},
    onShowPropsEditor: () => {},
    onUpdateRootConfigs: () => {},
});

export default AppContext;