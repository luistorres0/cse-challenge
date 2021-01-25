## Assignment

You've been given a sample CSV of course data to load. Using the data in `data/courses.csv`, create a script that:

- reads the data from the courses.csv file
- creates a JSON object for each line in the CSV populating the `subjectCode`, `number`, `title`, and `credits` and `POST` it to `https://localhost/courses`.

The script should address the following scenarios:

- the `subjectCode` property should be populated with the `id` property of the subjectCode object with the matching name property found in `data/subjectCodes.csv`:

```json
"subjectCode": "qwer1234"
```

- if the `creditType` for a course is `fixed` the `credits` property should be formatted as follows (using the appropriate credit value):

```json
"credits": {
  "value": 3,
  "type": "fixed"
}
```

- if the `creditType` for a course is `range` the `credits` property should be formatted as follows (using the appropriate credit value):

```json
"credits": {
  "min": 3,
  "max": 5,
  "type": "range"
}
```

- if the `creditType` for a course is `multiple` the `credits` property should be formatted as follows (using the appropriate credit value):

```json
"credits": {
  "min": 3,
  "max": 5,
  "type": "multi"
}
```
