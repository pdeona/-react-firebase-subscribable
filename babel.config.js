module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-flow',
    'minify',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
  env: {
    test: {
      presets: [
        '@babel/preset-flow',
        '@babel/preset-react',
        ['@babel/preset-env', { modules: 'commonjs' }],
      ]
    }
  }
}
