# Simple lighthouse analyzer
## Description
This is a simple script that runs lighthouse on one or more urls and outputs the results in a tsv file in a way that after importing it in a spreadsheet you can easily compare the results, calculate averages, etc.

## Usage
First, install the dependencies:
```js
npm install
```

Then, run the script:

```js
npm run start https://www.example.com [https://www.example2.com ...]
```
The report will generated in the 'reports' folder.
