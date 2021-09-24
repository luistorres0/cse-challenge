const {
  createCourseRecord,
  getGroupOptions,
  getCampusOptions,
  getSubjectCodeOptions,
} = require("./utils/utils");

const fs = require("fs");
const csv = require("@fast-csv/parse");

// Takes one row from the CSV data and uses it as well as the subjectCode, campus, and group options (also the dateStart map) to format an object correctly
// for posting to the API. After formatting, the new object is posted to the API.
function processRow(row, subjectCodeOptions, groupOptions, campusOptions, dateStartMappings) {
  const newJSON = {};

  // Set the subjectCode prop
  const { subjectCode } = row;
  if (subjectCode in subjectCodeOptions) {
    newJSON["subjectCode"] = subjectCodeOptions[subjectCode].id;
  } else {
    newJSON["subjectCode"] = "";
  }

  // Set the number and title props
  newJSON["number"] = row.number;
  newJSON["title"] = row.title;

  // Set the credits field
  const { creditType, creditsMin, creditsMax } = row;
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
  const [term, year] = row.dateStart.split(" ");
  newJSON["dateStart"] = dateStartMappings[term].replace("YYYY", year);

  // Set the groupFilter1 and groupFilter2 props
  const { department: groupName } = row;
  if (groupName in groupOptions) {
    newJSON["groupFilter1"] = groupOptions[groupName].id;
    newJSON["groupFilter2"] = groupOptions[groupName].parentId;
  } else {
    newJSON["groupFilter1"] = "";
    newJSON["groupFilter2"] = "";
  }

  // Set the campuses prop
  const campuses = row.campus.split(",");
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
}

// Creates new records from the input CSV file.
async function createRecordsFromCSV(filePathToCSV) {
  // Get the subjectCode options
  const subjectCodeOptions = await getSubjectCodeOptions();

  // Get the group options
  const groupOptions = await getGroupOptions();

  // Get the campus options
  const campusOptions = await getCampusOptions();

  // Create a dictionary to map the 'dateStart' prop in each record to a date string
  const dateStartMappings = {
    Winter: "YYYY-01-01",
    Spring: "YYYY-04-03",
    Summer: "YYYY-07-04",
    Fall: "YYYY-10-04",
  };

  fs.createReadStream(filePathToCSV, "utf8")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.log(error))
    .on("data", (row) =>
      processRow(row, subjectCodeOptions, groupOptions, campusOptions, dateStartMappings)
    )
    .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));
}

// Call our function and create the records
createRecordsFromCSV(__dirname + "/data/courses.csv");
