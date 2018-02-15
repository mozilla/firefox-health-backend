# Project *Firefox Health*

Firefox metrics & insights backend.
For the frontend code visit the [Firefox health dashboard](https://github.com/mozilla/firefox-health-dashboard) repo.

[![Build Status](https://api.travis-ci.org/mozilla/firefox-health-backend.svg?branch=master)](https://travis-ci.org/mozilla/firefox-health-backend)

## Requirements

* Node
* Yarn (recommended)

## Setting project up

In your console:
```
yarn // To get the dependencies installed
yarn start // To start the server
```

### Providing a Google API key

The [notes](http://localhost:3000/api/perf/notes) API requires a `GOOGLE_API_KEY`
in order to access a Google Spreadsheet. In order for this API to work locally
you need to create an API key for it.

Follow these instructions

* Visit [Google's cloud dashboard](https://console.cloud.google.com/apis/dashboard)
* Create a new project
* Select "Enable APIs and services" and enable "Google Sheets API"
* Back on the dashboard, go to credentials and create credentials
  * Do not use the wizard but select "API Key" from the drop down
* Name it something recognizable like "fx health local server"
* Start the backend like this:

```
GOOGLE_API_KEY=<created API key> yarn start
```
* Visit http://localhost:3000/api/perf/notes to verify it works

## Attributions

- heartbeat icon by Creative Stall from the Noun Project
