# Munchies!

Discovering the Food Trucks of San Francisco

## Get Some Food!
*Munchies* is a simple, responsive, immediate connection to nearest food trucks to your current location (if you've got GPS enabled!). 

See it deployed at: [http://uber-munchies.herokuapp.com/](http://uber-munchies.herokuapp.com/) 
## Run It

The repo: clone it! 

then,
```
npm install
```

then, 
    
Update the ```config.js``` for the proper path to your ```mongoDB```

then, 

Build and run tests (observe failing test and cringe):

```
gulp
```

then,

Start the API syncing tool to sync local db with remote api:
```
.bin/api_sync
```

then,
    
Start the web server:
```
.bin/www
```

then,

navigate to your ```localhost``` and ```port (default 4000)```,

then,

if you just want to explore the API data, get some `json` at the API route: `/api/v1/trucks`

finally,

EAT ALL OF THE FOOD!
------------------

I approached this project with a focus on the __back-end__, however I found some fulfillment in giving it a front-end that qualifies as a good start.

__Front-end:__ a single page rendered from jade templates on the server, and subsequently updated via ajax calls that respond to the user's interactions.

*no front-end framework for this little app (occasionally regretful)*

*styles courtesy of bootstrap, because it's a really "fresh" look*

__Back-end:__ consists of a few separate components. 
* API Sync Worker
    - pulls all records from the [DataSF](http://www.datasf.org/) public API and syncs them with our local instance. The worker will not make requests to update with the local db if no changes have been observed in the data provided by the public API.
    - *Stack:* nodeJS and *nix crontab
* a Database Service
   - faciliates communication and transactions between the database and other consumers (the sync worker and the web server)
   - *Stack:* nodeJS, mongoDB, mongoose (a mongo ORM)
* a Web Server 
    - routes requests for static assets, web, and the REST API (with a whopping single resource - trucks!)
    - *Stack:* nodeJS, expressJS, mongoDB, mongoose (a mongo ORM)

##The technologies
I chose nodejs out of desire to move quickly - knowing that my dev environment and past few deployments were in node gave me security in more accurately scoping my work. It was my first time using ExpressJS's generator, which gave me a scaffold and bolierplate middleware. I don't think I would choose to use it again because what it provided was not a strong match for what I ended up implementing, and I probably gutted, rewrote and reorganized most of what it generated.

My database, mongoDB, was selected based on a few known features:

1. Primarily used to store data that is provided by an external API
2. No extensive relationships to model among the data.
3. Mongo's native impelmentation of GeoSpatial indexes. 

I wanted to leave room for the external API's schema to change without having to rebuild a database from scratch, and I also knew that even with the addition of a few other resources, like users and food categories, I'd be happier to have the flexibility of no schemas and the out-of-the-box geospatial querying. 

The trade-off for using mongo, and its ORM mongoose, is that I find it's query language is not documented very thoroughly. Forming bulk upserts and geospatial queries requires knowing about a quirk or two in mongoose, as well as some creative diversion from mongo's documentation, and a little bit of digging on stack overflow.

Front-end: a framework might have helped me structure my code more cleanly. I figured it would be overkill for this project, but I came to find that I wasn't totally enjoying the process of navigating my code after all of my recent development having been done in angular, backbone, etc. I guess, for me, a little structure and convention can go a long way, even in a small app. 

##Testing
My biggest failure on this project was moving too quickly in the begining and not sticking with TDD. A test framework, Mocha, with tools like Chai, Supertest and Sinon, are all usually a good to help me with my development. However, I spun my wheels very long on what appears to be currently broken implementations in mocha for asynchronous testing. I found a number of issues on github where this has been identified, but it looks to me that mocha is probably without a devout maintainer at this stage. Without being able to successfully stub out any of the features of my API without my tests allowing me to resolve in callbacks or promises, I decided I would move forward with building and figure out which Mocha commit to roll back to later, or which past project to yank it from. It was a tough decision but I felt pressure to advance and build it out. Now I have an incomplete test suite and it's the absolute priority to fix this before implementing any new features.

my blog: [www.adamrichman.com](http://www.adamrichman.com)

my resume: [via dropbox](https://www.dropbox.com/s/88stgezde3ecihh/Adam%20Richman%20Resume.pdf?dl=0)

my github: [github.com/adrichman](http://github.com/adrichman)

### TODO:

* enable initialization without requiring geolocation service
* parse pdf schedules to query for "open now"
* filter by food type
* food types (filter by)
* more test coverage