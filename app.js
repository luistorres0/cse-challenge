require("dotenv").config();
const { API_KEY } = process.env || "";
const fs = require("fs").promises;
const axios = require("axios");

async function getSubjectCodeOptions() {
  const response = await axios({
    method: "get",
    url: "https://stucse.kuali.co/api/cm/options/types/subjectcodes",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const subjectCodes = response.data.reduce((obj, code) => {
    return {
      ...obj,
      [code.name]: { ...code },
    };
  }, {});

  return subjectCodes;
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

async function createRecordsFromCSV(filePathToCSV) {
  const csv = await readCSV(filePathToCSV);

  const recordsFromCSV = parseCsvDataToObjects(csv);

  const subjectCodeOptions = await getSubjectCodeOptions();

  const groupOptions = await getGroupOptions();

  const campusOptions = await getCampusOptions();

  const dateStartMappings = {
    Winter: "YYYY-01-01",
    Spring: "YYYY-04-03",
    Summer: "YYYY-07-04",
    Fall: "YYYY-10-04",
  };

  recordsFromCSV.forEach((record) => {
    const newJSON = {};

    // Set the subjectCode prop
    const { subjectCode } = record;
    if (subjectCode in subjectCodeOptions) {
      newJSON["subjectCode"] = subjectCodeOptions[subjectCode].id;
    } else {
      newJSON["subjectCode"] = "";
    }

    // Set the number and title props
    newJSON["number"] = record.number;
    newJSON["title"] = record.title;

    // Set the credits field
    const { creditType, creditsMin, creditsMax } = record;
    switch (creditType) {
      case "fixed":
        newJSON["credits"] = {
          chosen: "fixed",
          credits: {
            min: creditsMin,
            max: creditsMin,
          },
          value: creditsMin,
        };
        break;
      case "multiple":
        newJSON["credits"] = {
          chosen: "multiple",
          credits: {
            min: creditsMin,
            max: creditsMax,
          },
          value: [creditsMin, creditsMax],
        };
        break;
      case "range":
        newJSON["credits"] = {
          chosen: "range",
          credits: {
            min: creditsMin,
            max: creditsMax,
          },
          value: { min: creditsMin, max: creditsMax },
        };
        break;
    }

    // Set the status prop
    newJSON["status"] = "draft";

    // Set the dateStart prop
    const [term, year] = record.dateStart.split(" ");
    newJSON["dateStart"] = dateStartMappings[term].replace("YYYY", year);

    // Set the groupFilter1 and groupFilter2 props
    const { department: groupName } = record;
    if (groupName in groupOptions) {
      newJSON["groupFilter1"] = groupOptions[groupName].id;
      newJSON["groupFilter2"] = groupOptions[groupName].parentId;
    } else {
      newJSON["groupFilter1"] = "";
      newJSON["groupFilter2"] = "";
    }

    // Set the campuses prop
    const campuses = record.campus.split(",");
    const newObj = {};
    campuses.forEach((campus) => {
      if (campus in campusOptions) {
        newObj[campusOptions[campus].id] = true;
      }
    });

    newJSON["campus"] = newObj;

    // Set the notes prop
    newJSON["notes"] = "Submitted by Luis Torres";

    // Post the new entry to the API
    createCourseRecord(newJSON);

    // console.log(newJSON);
  });
}

createRecordsFromCSV(__dirname + "/data/courses.csv");
