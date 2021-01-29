### Submission
- Create a github repo and send along the link
- Commit your work as you work documenting each commit
- Make sure not to commit the API key you've been given!

### Assignment

You've been given a sample CSV of course data to load. Using the data in `data/courses.csv`, create a script that:

- reads the data from the courses.csv file
- creates a JSON object for each line in the CSV populating the `subjectCode`, `number`, `title`, `dateStart`, `groupFilter1`, `groupFilter2`, `credits`,`campus`, and `notes` properties for each course (see formatting requirements below) and `POST` it to `https://stucse.kuali.co/api/cm/courses/` for each of the courses. The data submitted to this API will be reviewed as part of this assessment.

Here is an example of what the data should look like when it's been sent to to the API endpoint noted above:
```json
{
  "subjectCode": "6012dd6a016ce30026cbd08d",
  "number": "101",
  "title": "Accounting 101",
  "credits": {
    "chosen": "fixed",
    "credits": {
      "min": "3",
      "max": "3"
    },
    "value": "3"
  },
  "status": "draft",
  "dateStart": "2021-04-03",
  "groupFilter1": "6012e9eaffe5da00a2a51cbb",
  "groupFilter2": "6012e96effe5da00a2a51cb9",
  "campus": {
    "6012de03baa3f800262b5dbf": true,
    "6012ddfbe43ec1002784e1c5": true
  },
  "notes": "Submitted by <my name>"
}
```

Please see the [Kuali Developer Documentation](https://developers.kuali.co) for more information about specific API calls. Any of the `core` and `cm` API endpoints can be used for this assignment.

### Data Point Requirements
- `subjectCode` will need to use the corresponding `id` of the relevant `subjectcode option`. This data can be retrieved using the `options` API endpoints: https://developers.kuali.co/#cm-options-option-types
  - use the `id` of the `subjectcodes` option with the name that matches the value in the CSV
  - do not populate this field if no corresponding option is found
- use the raw value in the `number` and `title` fields of the CSV
- the `credits` field should be formatted using he following conditions:
  - if the `creditType` is `fixed` the credit data should be as follows, using the `creditsMin` value for `min`, `max`, and `value`:
  ```json
  "credits": {
    "chosen": "fixed",
    "credits": {
      "min": "3",
      "max": "3"
    },
    "value": "3"
  }
  ```
  - if the `creditType` is `multiple` the credit data should be as follows, using the `creditsMin` value for `min`, `creditsMax` for the `max`, and both values in the `value` array:
  ```json
  "credits": {
    "chosen": "multiple",
    "credits": {
      "max": 5,
      "min": 3
    },
    "value": [
      "3",
      "5"
    ]
  }
  ```
  - if the `creditType` is `range` the credit data should be as follows, using the `creditsMin` value for `min`, `creditsMax` for the `max` (in both places):
  ```json
  "credits": {
    "chosen": "range",
    "credits": {
      "min": "3",
      "max": "5"
    },
    "value": {
      "min": "3",
      "max": "5"
    }
  }
  ```
- `status` should always be `draft`
- `dateStart` will need to be transformed in to a YYYY-MM-DD date value. Use the year and term values to transform the value in required format and use the term mapping below:
  - Winter = YYYY-01-01
  - Spring = YYYY-04-03
  - Summer = YYYY-07-04
  - Fall = YYYY-10-04
- `groupFilter1` will need to use the corresponding `id` of the relevant `group`. This data can be retrieved using the `groups` API endpoint: https://developers.kuali.co/#groups-groups-get
  - use the `id` of the group with the name that matches the value in the CSV
  - use the `parentId` of this group for the `groupFilter2` field
  - do not populate this field if no corresponding group is found
- `campus` will need to use the corresponding `id` of the relevant `campuses option`. This data can be retrieved using the `options` API endpoints: https://developers.kuali.co/#cm-options-option-types
  - use the `id` of the `campus` option(s) with the name that matches the value in the CSV to create this fields data as follows:
  ```json
  "campus": {
    "6012de03baa3f800262b5dbf": true,
    "6012ddfbe43ec1002784e1c5": true
  }
  ```
  - omit any campus options not found in the options API endpoint
- `notes` **should have your name** as well as any notes you might like to put on the records you're submitting.

You are welcome to use third party libraries.
