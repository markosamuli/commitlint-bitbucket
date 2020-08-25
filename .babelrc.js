module.exports = api => {
    api.cache(() => process.env.NODE_ENV);
    return {
      ignore: [/node_modules/],
      sourceMaps: false,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
              browsers: []
            }
          }
        ]
      ],
      plugins: []
    };
  };
