require("dotenv").config();
const { API_KEY } = process.env || "";
const axios = require("axios");

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
  createCourseRecord,
  getGroupOptions,
  getCampusOptions,
  getSubjectCodeOptions,
};
