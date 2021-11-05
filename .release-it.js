module.exports = {
  github: {
    release: true,
    releaseName: "Release ${version}",
    assets: ["dist/*.zip"],
  },
  npm: {
    publish: true,
  },
  git: {
    tag: true,
    commit: true,
    commitMessage: "chore(release): release ${version}",
  },
  plugins: {
    "@release-it/conventional-changelog": {
      ignoreRecommendedBump: true,
      preset: {
        name: "conventionalcommits",
        types: [
          { type: "feat", section: "Features" },
          { type: "fix", section: "Bug Fixes" },
          { type: "chore", section: "Chores" },
          { type: "revert", section: "Reverts" },
       ],
      },
      infile: "CHANGELOG.md",
    },
  },
};
