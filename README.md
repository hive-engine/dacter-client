# DACTER Client Module

## Requirements

1. [NodeJS 16 LTS](https://nodejs.org/en/) or later
2. A computer or VPS with a public IP

The server requirement is very minimal. You can run this with other projects on the same server.

## How to Install

Clone this repository on your VPS. If you do not have git installed, you can download the repository too.

```
git clone https://github.com/hive-engine/dacter-client.git
```

Assuming you have NodeJS already installed, move to the folder and install the dependencies.

```
cd dacter-client
```

```
npm install
```

## Set Environment Variables

Rename `example.env` to `.env` and set your Hive username, private active key, and the port you want to run on. The default port is 3001.

`ACCOUNT` - Your Hive username. e.g reazuliqbal

`SIGNING_PRIVATE_KEY` - Your Private Active key, e.g. 5K.......N8

`PORT` - The port on which you want to run the client module.

It is possible to run multiple instances of the client module on the same VPS/Computer on different accounts by changing the PORT.

## Run

You can start running the client module with the following command.

```
npm start
```

I recommend using a process manager such as PM2 to keep running the instance even when you are logged out. Below is an example of PM2 ecosystem configuration for multiple instances.

```javascript
// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "dacter-client-one",
      script: "app.mjs",
      env_production: {
        NODE_ENV: "production",
        TZ: "UTC",
        ACCOUNT: "reazuliqbal",
        SIGNING_PRIVATE_KEY: "5K.......N8",
        PORT: 3001,
      },
    },
    {
      name: "dacter-client-two",
      script: "app.mjs",
      env_production: {
        NODE_ENV: "production",
        TZ: "UTC",
        ACCOUNT: "reazul-dev",
        SIGNING_PRIVATE_KEY: "5k.......N8",
        PORT: 3002,
      },
    },
  ],
};
```

Change the information according to your need, save it as `ecosystem.config.js`, and then you'd start the instances.

```
pm2 start ecosystem.config.js --env production
```

As soon as you start the module, it will register itself with the DACTER Core module. After you create an account, you'll be getting paid in BEE sent to your Hive-Engine wallet.
