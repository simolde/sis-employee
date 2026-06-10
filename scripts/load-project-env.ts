import {
  existsSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  config,
} from "dotenv";

let environmentLoaded = false;

export function loadProjectEnvironment(): void {
  if (environmentLoaded) {
    return;
  }

  const envPath =
    resolve(
      process.cwd(),
      ".env",
    );

  if (existsSync(envPath)) {
    const result =
      config({
        path: envPath,
        override: false,
        quiet: true,
      });

    if (result.error) {
      throw new Error(
        `Unable to load the project environment file at ${envPath}.`,
        {
          cause: result.error,
        },
      );
    }

    environmentLoaded = true;

    return;
  }

  if (process.env.DATABASE_URL) {
    environmentLoaded = true;

    return;
  }

  throw new Error(
    [
      "The project environment could not be loaded.",
      `Expected local environment file: ${envPath}`,
      "The project currently uses .env; .env.local is not assumed.",
    ].join(" "),
  );
}