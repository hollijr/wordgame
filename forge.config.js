module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "wordgame"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        darwin
      ]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ],
  plugins: [
      ['@electron-forge/plugin-webpack', {
        // other Webpack plugin config...
        devContentSecurityPolicy: `font-src 'self' 'unsafe-inline' https://static2.sharepointonline.com https://spoppe-b.azureedge.net data:; default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:`,
        // other Webpack plugin config...
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              "html": "./src/index.html",
              "js": "./src/renderer.ts",
              "name": "main_window",
              "preload": {
                "js": "./src/preload.js"
              }
            }
          ]
        },
      }]
    ]
  }