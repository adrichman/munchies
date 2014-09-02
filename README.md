# Munchies!

Discovering the Food Trucks of San Francisco

## Get Some Food!
*Munchies* is a simple, responsive, immediate connection to nearest food trucks to your current location (if you've got GPS enabled!). 

__Front-end:__ a single page rendered from jade templates on the server, and subsequently updated via ajax calls that respond to the user's interactions.

*no front-end framework for this little app (occasionally regretful)*

*styles courtesy of bootstrap, because it's a really "fresh" look*

__Back-end:__ consists of a few separate components. 
* API Sync Worker
    - pulls all records from the [DataSF](http://www.datasf.org/) public API and syncs them with our local instance. The worker will not make requests to update with the local db if no changes have been observed in the data provided by the public API.
    - *Stack:* nodeJS and *nix
* a Database Service
   - faciliates communication and transactions between the database and other consumers (the sync worker and the web server)
   - *Stack:* nodeJS, mongoDB, mongoose (a mongo ORM)
* a Web Server 
    - routes requests for static assets, web, and the REST API (with a whopping single resource - trucks!)
    - *Stack:* nodeJS, expressJS, mongoDB, mongoose (a mongo ORM)


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

### TODO:

* enable initialization without requiring geolocation service
* parse pdf schedules to query for "open now"
* filter by food type
* food types (filter by)
* more test coverage