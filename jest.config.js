module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "json",
  ],
  moduleNameMapper: {
    "~/([^\\.]*)$": "<rootDir>/src/$1"
  },
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/dist/"],
  collectCoverageFrom: ["src/**"]
}
