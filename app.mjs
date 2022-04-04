import Boom from "@hapi/boom";
import Glue from "@hapi/glue";
import { PORT } from "./config.mjs";
import { fetchCoreConfig, pingCoreModule } from "./utils.mjs";

const manifest = {
  server: {
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: false,
    },
    routes: {
      security: {
        hsts: false,
        xss: true,
        noOpen: true,
        noSniff: true,
        xframe: false,
      },
      cors: {
        origin: ["*"],
        credentials: true,
      },
      validate: {
        failAction(request, h, err) {
          const firstError = err.details[0];

          if (firstError.context.errorCode !== undefined) {
            throw Boom.badRequest(err.message, {
              errorCode: firstError.context.errorCode,
            });
          }

          throw Boom.badRequest(err.message);
        },
      },
    },
    mime: {
      override: {
        "text/event-stream": {
          compressible: false,
        },
      },
    },
    port: PORT,
    debug: process.env.NODE_ENV === "production" ? false : { request: ["*"] },
  },

  register: {
    plugins: [
      {
        plugin: await import("./plugins/routes.mjs"),
        options: {
          DIR: "./routes",
        },
      },
    ],
  },
};

const options = { relativeTo: "./" };

const continuePingCoreModule = async () => {
  await pingCoreModule();

  setTimeout(continuePingCoreModule, 1 * 30 * 1000);
};

const init = async () => {
  manifest.server.app = await fetchCoreConfig();

  const server = await Glue.compose(manifest, options);

  await server.start();

  await continuePingCoreModule();

  console.log("Client module is running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err.message);
  process.exit(1);
});

init();
