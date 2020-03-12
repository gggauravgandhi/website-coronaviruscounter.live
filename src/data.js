const cheerio = require("cheerio");
const fetch = require("node-fetch");
const jsonfile = require("jsonfile");
const path = require("path");

const data = {};
data.generator = {};
data.decorator = {};
data.utils = {};

data.generateStatesData = async () => {
  const statesData = await data.generator.states();

  try {
    await jsonfile.writeFile(
      path.resolve(__dirname, "../data/india.json"),
      statesData
    );
  } catch (exc) {
    throw exc;
  }
};

data.generateCountriesData = async () => {
  const countriesData = await data.generator.countries();

  try {
    await jsonfile.writeFile(
      path.resolve(__dirname, "../data/world.json"),
      countriesData
    );
  } catch (exc) {
    throw exc;
  }
};

data.utils.remapStateNames = name => {
  const stateRenameMap = {
    "Union Territory of Jammu and Kashmir": "Jammu & Kashmir",
    "Union Territory of Ladakh": "Ladakh"
  };

  if (stateRenameMap[name]) {
    return stateRenameMap[name];
  } else {
    return name;
  }
};

data.utils.calculateTotalCount = data => {
  let count = 0;

  data.forEach(element => {
    count += element.count;
  });

  return count;
};

data.generator.states = async () => {
  let statesData = [];

  try {
    const response = await fetch("http://www.mohfw.gov.in/");
    const responseBody = await response.text();

    let $ = cheerio.load(responseBody);
    const result = $("tr")
      .map((i, element) => ({
        title: data.utils.remapStateNames(
          $(element)
            .find("td:nth-of-type(2)")
            .text()
            .trim()
        ),
        count:
          parseInt(
            $(element)
              .find("td:nth-of-type(3)")
              .text()
              .trim()
          ) +
          parseInt(
            $(element)
              .find("td:nth-of-type(4)")
              .text()
              .trim()
          ),
        boxClass: "state"
      }))
      .get();

    // Remove header and footer values
    result.shift();
    result.pop();

    // Insert country wide total
    const totalCount = data.utils.calculateTotalCount(result);
    result.unshift({
      title: "India",
      count: totalCount,
      boxClass: "country"
    });

    statesData = result;
  } catch (exc) {
    throw exc;
  }

  return {
    items: statesData,
    news:
      `The total number of confirmed Coronavirus cases has now gone up to ${statesData[0]['count']} in India, according to the Union Health Ministry as on ${(new Date()).toLocaleString()}.`
  };
};

data.generator.countries = async () => {
  let countriesData = [];

  try {
    const response = await fetch("https://www.worldometers.info/coronavirus/");
    const responseBody = await response.text();

    let $ = cheerio.load(responseBody);

    const result = $("tr")
      .map((i, element) => ({
        title: data.utils.remapStateNames(
          $(element)
            .find("td:nth-of-type(1)")
            .text()
            .trim()
        ),
        count: parseInt(
          $(element)
            .find("td:nth-of-type(2)")
            .text()
            .trim()
            .replace(/,/g, "")
        ),
        boxClass: "country",
        countryPageURL:
          "/" +
          data.utils.remapStateNames(
            $(element)
              .find("td:nth-of-type(1)")
              .text()
              .trim()
          )
      }))
      .get();

    // Remove header and footer values
    result.shift();
    result.pop();

    // Insert country wide total
    const totalCount = data.utils.calculateTotalCount(result);
    result.unshift({
      title: "World",
      count: totalCount,
      boxClass: "planet"
    });

    countriesData = result;
  } catch (exc) {
    throw exc;
  }

  return {
    items: countriesData,
    news:
    `The total number of confirmed Coronavirus cases has now gone up to ${countriesData[0]['count']} in World, according to the <a href="https://www.worldometers.info/coronavirus/">WorldMeters</a> as on ${(new Date()).toLocaleString()}.`
  };
};

module.exports = data;
