import path from "path";
import glob from "fast-glob";

const getRoutes = async (baseDir, pattern = "**/!(_)*.mjs") => {
  const absolutePattern = path.join(baseDir, pattern);
  const filePaths = await glob(absolutePattern);

  const routes = [];

  for (let index = 0; index < filePaths.length; index++) {
    routes.push((await import(path.resolve(filePaths[index]))).default);
  }

  return routes;
};

const plugin = {
  name: "routes",

  version: "1.0.0",

  async register(server, { DIR }) {
    const routes = await getRoutes(DIR);

    routes.forEach((r) => {
      server.route(r);
    });
  },
};

export { plugin };
