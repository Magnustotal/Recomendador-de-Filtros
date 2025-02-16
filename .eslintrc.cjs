{
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2020, // O la versión de ECMAScript que desees usar
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "es6": true
  },
  "rules": {
    // Puedes añadir o sobreescribir reglas aquí
    "no-console": "warn", // Advierte sobre el uso de console.log
    "no-unused-vars": "warn"
  }
}