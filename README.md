# Firefox Health backend

Firefox metrics & insights backend.
For the frontend code visit the [Firefox health dashboard](https://github.com/mozilla/firefox-health-dashboard) repo.

[![Build Status](https://api.travis-ci.org/mozilla/firefox-health-backend.svg?branch=master)](https://travis-ci.org/mozilla/firefox-health-backend)

## Requirements

* Node
* Yarn
* Docker OR redis

## Setting project up

In your console:

```shell
docker run -p 6379:6379 -d redis
yarn // To get the dependencies installed
yarn start // To start the server
```

### Enable access to Nimbledroid's data

Nimbledroid provides us with performance data for various sites on Android.
If you want to make changes to the Nimbledroid APIs on the backend you will need
to have access to our corporate Nimbledroid account.

Once you have access you can fetch your personal key (keep private) under your
[account](https://nimbledroid.com/account). You can re-generate it there if it ever gets leaked.

Once you have it you can start the backend like this:

```shell
export NIMBLEDROID_API_KEY=<API key>
export NIMBLEDROID_EMAIL=<your email address>
export REDIS_URL=redis://localhost:6379
// Change DEBUG to script:* if you also want debug output
DEBUG=script:info,script:error yarn fetchNimbledroidData
yarn start
```

Load [this page](http://localhost:3000/api/android/nimbledroid?product=com.chrome.beta) to verify it works.

### Redis

If you want to test caching with Redis (there's caching with JS as a fallback) make sure to install Redis and set the REDIS_URL env to `redis://localhost:6379` before starting the server.

## How the Nimbledroid data is fetched

In order to fetch the data from Nimbledroid's APIs we need an API key, thus, we need to use this backend.
In order to handle the inefficient APIs we store the data in Redis.

This is how we fetch, store & serve the data:

* We schedule a job every hour on Heroku
* This job executes the [fetchNimbledroidData.js](https://github.com/mozilla/firefox-health-backend/blob/master/src/scripts/fetchNimbledroidData.js) script
* If any of the profiles fetched are new we store them on Redis
* When the frontend hits this backend we return data from our Redis storage

This set up above is accomplished via the "firefox-health-backend" app on Heroku.

These env variables are needed:

* NIMBLEDROID_API_KEY
* NIMBLEDROID_EMAIL

The addons involved are:

* Heroku Redis
* Heroku Scheduler

In order to report any issues with fetching the data we've also enabled the "Dead Man's snitch" (DMS) on Heroku.
Ths add-on expects the Heroku scheduled job to consistently report a successful run.
If DMS does not hear back from the script after a couple of hours it will send an email notifying few users.
You can adjust who the recipients of the alerts are via the add-on on Heroku.

### Nimbledroid data seems old

First check the APKs uploaded dates from [Nimbledroid](https://nimbledroid.com/my_apps). Hover over the apps to verify the match the package IDs (e.g. [org.mozilla.klar](https://nimbledroid.com/my_apps/org.mozilla.klar?a=2ab0db47-8e11-4be3-bd58-cfec06e225e9#summary).

If everything seems fine, try to run the script as described in the section above to see if there's anything broken.

If everything works, load the Nimbledroid APKs directly and inspect the output.

## Attributions

* heartbeat icon by Creative Stall from the Noun Project
