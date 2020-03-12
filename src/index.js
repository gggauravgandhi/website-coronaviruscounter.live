const dataObj = require("./data");

Promise.resolve()
  .then(dataObj.generateStatesData)
  .then(console.log)
  .catch(console.error);

Promise.resolve()
  .then(dataObj.generateCountriesData)
  .then(console.log)
  .catch(console.error);
