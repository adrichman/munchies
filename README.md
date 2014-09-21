# Munchies!

Discovering the Food Trucks of San Francisco

## Get Some Food!
*Munchies* is a simple, responsive, immediate connection to nearest food trucks to your current location (if you've got GPS enabled!). 

See it deployed at: [http://sf-munchies.herokuapp.com/](http://sf-munchies.herokuapp.com/) 
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

* more test coverage
* enable initialization without requiring geolocation service
* parse pdf schedules to query for "open now"
* filter by food type
* food types (filter by)
* an eventing or pub/sub module to allow for more decoupling and fewer dependencies. 
