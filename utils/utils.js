require("dotenv").config();
const { API_KEY } = process.env || "";
const fs = require("fs").promises;
const axios = require("axios");

// Fetches data using axios.
async function fetchData(method, url, data) {
  const response = await axios({
    method,
    url,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    data,
  });

  return response.data;
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

// Gets the subjectCode options from the API
async function getSubjectCodeOptions() {
  const data = await fetchData("get", "https://stucse.kuali.co/api/cm/options/types/subjectcodes");
  return arrayToObject(data, "name");
}


async function readCSV(path) {
  const data = await fs.readFile(path, "utf8");
  return data;
}

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

async function getGroupOptions() {
  const response = await axios({
    method: "get",
    url: "https://stucse.kuali.co/api/v1/groups/",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const groups = response.data.reduce((obj, group) => {
    return {
      ...obj,
      [group.name]: { ...group },
    };
  }, {});

  return groups;
}

async function getCampusOptions() {
  const response = await axios({
    method: "get",
    url: "https://stucse.kuali.co/api/cm/options/types/campuses",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const campuses = response.data.reduce((obj, campus) => {
    return {
      ...obj,
      [campus.name]: { ...campus },
    };
  }, {});

  return campuses;
}

async function createCourseRecord(newRecord) {
  const response = await axios({
    method: "post",
    url: "https://stucse.kuali.co/api/cm/courses/",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    data: newRecord,
  });

  console.log(response.data);
}

module.exports = {
  readCSV,
  parseCsvDataToObjects,
  createCourseRecord,
  getGroupOptions,
  getCampusOptions,
  getSubjectCodeOptions,
};
