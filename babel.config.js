module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "entry",
                "corejs": {
                    version: "3",
                    proposals: true
                },
                "targets": "> 0.25%, not dead"
            }
        ],
        [
            "@babel/preset-react",
            {
                "runtime": "automatic"
            },
        ]
    ],
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ]
}