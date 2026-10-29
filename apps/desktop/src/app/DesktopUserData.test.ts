import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

import { resolveUserDataPath } from "./DesktopUserData.ts";

it.effect("keeps the school profile separate from an existing Windows profile", () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const directory = yield* fs.makeTempDirectoryScoped({ prefix: "t3-school-profile-" });
    const existing = path.join(directory, "t3code-v2");
    yield* fs.makeDirectory(existing, { recursive: true });
    yield* fs.writeFileString(path.join(existing, "Local State"), "existing profile");
    const resolved = yield* resolveUserDataPath({
      appDataDirectory: directory,
      isDevelopment: false,
      platform: "win32",
    });
    assert.equal(resolved, path.join(directory, "t3code-school"));
    assert.equal(yield* fs.readFileString(path.join(existing, "Local State")), "existing profile");
    assert.isFalse(yield* fs.exists(resolved));
  }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
);
