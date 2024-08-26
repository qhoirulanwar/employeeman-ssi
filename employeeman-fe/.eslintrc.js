const { resolve } = require('node:path');

// const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  "extends": "next",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
};
