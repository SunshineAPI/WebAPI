# Sunshine [![travis](https://img.shields.io/travis/SunshineAPI/SunshineWebAPI/master.svg?style=flat-square)](https://travis-ci.org/SunshineAPI/SunshineWebAPI/)

Sunshine is a REST API for interaction with the [Overcast Network](https://oc.tc) and all related services including the forums, servers, maps, and authenticated endpoints.

Sunshine provides these services, both authenticated, and non-authenticated through a JSON Web API served by [NodeJS](https://nodejs.org/), with data scraped from the Overcast Network with [Cheerio](https://github.com/cheeriojs/cheerio).

View the documentation for Sunshine on the [website](http://sunshine.bearden.io/)

Sunshine is *not* affiliated with the Overcast Network, and will not be held liable for the actions performed through the API.

## Installing
0. Install [redis](http://redis.io/) and [NodeJS](https://nodejs.org/)
0. Run ```npm install```.
0. Start redis and run ```npm start```

## License
Sunshine is licensed to the Sunshine API Development team under the *General Public License (GPL) v3* license, requiring that all forks and changes made to the Sunshine API are open-sourced. We suggest that you pull request any changes that you make in order to better the API for everyone, but this is not necessary in accordance to the license.