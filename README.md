# DEPRECATED

This repository is no longer supported, please consider using the GOBI service instead.

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

## Collection Development Javascript

This JS helps with the user interface of the collection development spreadsheets while the Python collectiondevelopment depo provides the back end.

### Install for Dev
1. `npm install`
2. `grunt` for production build
3. `grunt staging` for staging build

Grunt will run unit tests and combine and minify the files. This project would benefit from being reworked to use JS modules and webpack + Babel, but it works.

---

The brunt of the code is to validate input and send data to and respond to the server.