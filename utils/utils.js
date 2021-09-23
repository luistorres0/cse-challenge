require("dotenv").config();
const { API_KEY } = process.env || "";
const fs = require("fs").promises;
const axios = require("axios");

// Reads a csv file.
async function readCSV(path) {
  try {
    const data = await fs.readFile(path, "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
}

// Parses through a CSV string. The result is an array of objects(records): [{header1: value1, header2: value2}...]
function parseCsvDataToObjects(csvString) {
  const rows = csvString.split("\r\n");

  const headers = rows[0].split(",");

  const records = [];

  for (let i = 1; i < rows.length; i++) {
    let flag = 0;
    let str = "";
    for (let ch of rows[i]) {
      if (ch === '"' && flag === 0) {
        flag = 1;
      } else if (ch === '"' && flag === 1) {
        flag = 0;
      }
      if (ch === "," && flag === 0) {
        ch = "|";
      }
      if (ch !== '"') {
        str += ch;
      }
    }

    const values = str.split("|");

    const record = {};
    for (let index in headers) {
      record[headers[index]] = values[index];
    }

    records.push(record);
  }

  return records;
}

// Transforms an array of objects into a an object where each key corresponds to the value of 'prop' in each object
function arrayToObject(arrayOfObjects, prop) {
  return arrayOfObjects.reduce((obj, elem) => {
    return {
      ...obj,
      [elem[prop]]: { ...elem },
    };
  }, {});
}

// Fetches data using axios.
async function fetchData(method, url, data) {
  try {
    const response = await axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      data,
    });

    return response.data;
  } catch (err) {
    console.error(err);
  }
}

// Gets the subjectCode options from the API
async function getSubjectCodeOptions() {
  const data = await fetchData("get", "https://stucse.kuali.co/api/cm/options/types/subjectcodes");
  return arrayToObject(data, "name");
}

// Gets the group options from the API
async function getGroupOptions() {
  const data = await fetchData("get", "https://stucse.kuali.co/api/v1/groups/");
  return arrayToObject(data, "name");
}

// Gets the campus options from the API
async function getCampusOptions() {
  const data = await fetchData("get", "https://stucse.kuali.co/api/cm/options/types/campuses");
  return arrayToObject(data, "name");
}

// Posts a new course record to the API.
async function createCourseRecord(newRecord) {
  const data = await fetchData("post", "https://stucse.kuali.co/api/cm/courses/", newRecord);
  return data.item;
}

module.exports = {
  readCSV,
  parseCsvDataToObjects,
  createCourseRecord,
  getGroupOptions,
  getCampusOptions,
  getSubjectCodeOptions,
};
