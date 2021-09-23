const {
  readCSV,
  parseCsvDataToObjects,
  createCourseRecord,
  getGroupOptions,
  getCampusOptions,
  getSubjectCodeOptions,
} = require("./utils/utils");

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
    // createCourseRecord(newJSON);

    console.log(newJSON);
  });
}

createRecordsFromCSV(__dirname + "/data/courses.csv");
