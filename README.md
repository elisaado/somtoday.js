# SOMtoday.js

A JavaScript library for the SOMtoday REST API.

This project uses the [the somtoday api docs](https://github.com/elisaado/somtoday-api-docs).
I you need any help with this project feel free to join our discord!
[![Discord Chat](https://img.shields.io/discord/789249810032361502.svg)](https://discord.gg/yE3e3erCut)

## Installation

Use either npm, or yarn to install add the library to your project

`npm i somtoday.js --save`

`yarn add somtoday.js`

## Usage

Typescript example:

```ts
import somtoday from "somtoday.js";
async function main() {
  const org = await somtoday.searchOrganisation({
    name: "SCHOOL NAME HERE",
  });
  if (!org) throw new Error("School not found");
  const user = await org.authenticate({
    username: "SOMTODAY USERNAME",
    password: "SOMTODAY PASSWORD",
  });
  const students = await user.getStudents();
  console.log(students);
  console.log(":D");
}
main();
```

Javascript example:

```js
const somtoday = require("../somtoday.js").default;
async function main() {
  const org = await somtoday.searchOrganisation({
    name: "SCHOOL NAME HERE",
  });
  if (!org) throw new Error("School not found");
  const user = await org.authenticate({
    username: "SOMTODAY USERNAME",
    password: "SOMTODAY PASSWORD",
  });
  const students = await user.getStudents();
  console.log(students);
  console.log(":)");
}
main();
```
