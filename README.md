# Sunshine [![travis](https://img.shields.io/travis/SunshineAPI/WebAPI/master.svg?style=flat-square)](https://travis-ci.org/SunshineAPI/WebAPI/) [![Coveralls](https://img.shields.io/coveralls/SunshineAPI/WebAPI.svg?style=flat-square)](https://coveralls.io/github/SunshineAPI/WebAPI) [![Code Climate](https://img.shields.io/codeclimate/github//SunshineAPI/WebAPI.svg?style=flat-square)](https://codeclimate.com/github/SunshineAPI/WebAPI)

[![Dependencies](https://img.shields.io/david/SunshineAPI/WebAPI.svg?style=flat-square)](https://david-dm.org/SunshineAPI/WebAPI) [![Dev Dependencies](https://img.shields.io/david/dev/SunshineAPI/WebAPI.svg?style=flat-square)](https://david-dm.org/SunshineAPI/WebAPI#info=devDependencies)

Sunshine is a REST API for interaction with the [Overcast Network](https://oc.tc) and all related services including the forums, servers, maps, and authenticated endpoints.

Sunshine provides these services, both authenticated, and non-authenticated through a JSON Web API served by [NodeJS](https://nodejs.org/), with data scraped from the Overcast Network with [Cheerio](https://github.com/cheeriojs/cheerio).

View the documentation for Sunshine on the [website](https://sunshine-api.com/)

Sunshine is *not* affiliated with the Overcast Network, and will not be held liable for the actions performed through the API.

## Installing
0. Install [redis](http://redis.io/) and [NodeJS](https://nodejs.org/)
0. Run ```npm install```.
0. If it was not done automatically, copy ```config.example.js``` to ```config.js```. You can configure the app as you want.
0. Start redis and run ```npm start```


## Testing

Due to Sunshine being based on a 3rd party website, testing Sunshine is a complicated process. In order to not repeatedly make requests to Overcast, we have created a tool called [OvercastMock](https://github.com/SunshineAPI/OvercastMock) that scrapes and pushes web pages to [sunshine-mock](http://sunshineapi.github.io/sunshine-mock.github.io/). We are able to request these pages, similarly to how we do with the base API. This however does mean, that as of right now, or until we implement a solution, we are not able to test authenticated modules, or **POST** requests.

### Setup:
0. Run ```npm test``` to run feature tests, and confirm that endpoints work. The test url is configurable in the config, but should not be changed to prevent rapid requests to Overcast.
0. Run ```npm run-script test-all``` to run feature tests and generate code coverage information for Coveralls.

## License
Sunshine is licensed to the Sunshine API Development team under the *General Public License (GPL) v3* license, requiring that changes must be open sourced **if** the API is redistributed.

We suggest that you pull request any changes that you make in order to better the API for everyone, but this is not necessary in accordance to the license.
