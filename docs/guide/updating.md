---
type: guide
---
# Update an existing installation

Installing a new Cliewen npm package updates the CLI, but an existing project keeps its installed schema files. Run `update` to refresh installer-owned schema definitions and templates. The command preserves project configuration, the selected OpenSpec default, authored change artifacts and documents, and the AC registry.

## Install, preview, and apply

In your project, install the published alpha and preview the schema update:

```sh
npm install --save-dev cliewen-openspec@0.1.0-alpha.1
npx --no-install cliewen-openspec update --dry-run --json
```

The explicit version selects the published alpha; `@alpha` selects the current alpha tag. Avoid an unqualified installation while `latest` points to npm's staging placeholder. For a local build, run `npm pack` in the source checkout and install the resulting tarball instead. The npm install changes package metadata and dependencies as usual; the Cliewen update command is a separate operation on installed resources.

Review the preview's `writes` and `deletes` lists. `writes` includes templates/schema files to create or replace and the ownership manifest when it changes. `deletes` contains only retired installer-owned files. A dry run applies no writes, deletions, or interrupted-transaction recovery.

```sh
npx --no-install cliewen-openspec update --json
```

Update does not accept `--default`; it preserves `openspec/config.yaml` byte-for-byte. All commands accept `--root PATH` if you need to select a different project. An unchanged installation reports empty `writes` and `deletes` lists.

## Ownership and conflicts

The existing `.cliewen-openspec/manifest.json` records the hashes of files installed by Cliewen. Update checks every conflict before applying its resource changes:

- An unchanged owned file can be replaced. LF and CRLF line-ending differences are tolerated.
- An owned file already identical to the new package content can keep its content and receive the current ownership hash.
- A missing owned file is recreated from the package. Newly introduced files are installed only if their paths are free.
- An existing unowned file conflicts even when its content matches. Update does not silently adopt it.
- A retired owned file is deleted only when unchanged. Local edits to a current or retired owned file stop the update.

There is no force option. Review a conflict and retain useful custom instructions in a project-owned location before deliberately restoring an installer-owned file. Do not delete the manifest, registry, or authored artifacts to bypass ownership checks. Custom schemas outside Cliewen's owned paths are preserved.

The command validates manifest ownership paths/hashes and current project config/registry before changing resources. A missing manifest requires `init`; update will not reconstruct ownership from filenames. Development source for `0.2.0-alpha.1` accepts its own manifests and those from `0.1.0-alpha.1`, including earlier builds with fewer schemas. The published 0.1 package supports its own manifests only. Other versions and general configuration/registry migrations remain unsupported. New omitted policy settings use their defaults without rewriting existing configuration.

On the development version, the new test-quality policies default to `review`, so existing projects may see additional warnings. They become blocking only when you select `enforce`. See [policy configuration](../configuration.md#test-quality-and-lifecycle) to adopt or disable each independently.

## Recovery and verification

Apply uses the existing transaction journal. Content changes and retired-file deletions are recoverable; the new manifest is published last. If a write fails, rollback restores original files, removed files, and the previous manifest. A normal update first recovers a leftover valid journal; a dry run refuses it without changing anything. Use `recover` to resolve it separately when needed.

After applying, review the Git diff, validate the installed schema you use, and run the project tests:

```sh
npx --no-install openspec schema validate cliewen-delivery
npm test
```

Use `cliewen-discovery` or `cliewen-all` in the validation command for another workflow. Existing proposals, specs, decisions, tasks, and test titles are not rewritten by update. If a new contract requires metadata such as test types, review and add it in authored files yourself. Defaults for omitted config fields are read by the current CLI; update does not fill them into your config.

Commit the intended inputs before collecting fresh evidence for a delivery change. An old report is not rewritten or removed by update; revision freshness and contract checks can require recollection. Discovery and combined no-delivery outcomes retain their documented review-only evidence behavior. The [evidence guide](../testing/evidence.md) explains collection and scope.
