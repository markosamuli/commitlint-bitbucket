import execa from "execa";
import commitlint from "@commitlint/cli";

const GIT = "git";
const COMMIT = process.env.BITBUCKET_COMMIT;
const IS_PR = process.env.BITBUCKET_PR_ID ? true : false;
const DESTINATION_BRANCH = process.env.BITBUCKET_PR_DESTINATION_BRANCH;
const RANGE =
  DESTINATION_BRANCH && COMMIT ? `${DESTINATION_BRANCH}...${COMMIT}` : null;

main().catch((err) => {
  console.log(err);
  process.exit(1);
});

async function main() {
  validate();

  const args = process.argv.slice(2);

  if (IS_PR && RANGE) {
    const [start, end] = RANGE.split(".").filter(Boolean);
    await lint(["--from", start, "--to", end, ...args]);
  } else {
    const input = await log(COMMIT);
    await lint(args, { input });
  }
}

async function lint(args, options) {
  return execa(
    commitlint,
    args,
    Object.assign({}, { stdio: ["pipe", "inherit", "inherit"] }, options)
  );
}

async function log(hash) {
  const result = await execa(GIT, [
    "log",
    "-n",
    "1",
    "--pretty=format:%B",
    hash,
  ]);
  return result.stdout;
}

function validate() {
  if (process.env.CI !== "true" || !process.env.BITBUCKET_BUILD_NUMBER) {
    throw new Error(
      `commitlint-bitbucket is intended to be used on Bitbucket Pipelines`
    );
  }
  if (!process.env.BITBUCKET_PR_ID) {
    throw new Error(`commitlint-bitbucket will only work on pull requests`);
  }
}
