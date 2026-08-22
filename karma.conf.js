// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  const configuration = {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-browserstack-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: { random: false },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessLocal'],
    singleRun: false,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessLocal: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--window-size=1024,768'],
      },
      BrowserstackChromeCI: {
        base: 'BrowserStack',
        browser: 'Chrome',
        version: 'latest',
        os: 'Windows',
        os_version: '10',
      },
    },
  };

  if (process.env.CI) {
    configuration.singleRun = true;
  }

  // Upstream sends every CI run to akveo's BrowserStack account, whose credentials were hardcoded
  // in their pr-check workflow. This fork has no BrowserStack subscription and is not entitled to
  // theirs, so the BrowserStack launcher is only used when credentials are actually supplied -
  // otherwise CI runs the same headless Chrome as a local run.
  const hasBrowserStack = process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY;

  if (process.env.CI && hasBrowserStack) {
    config.browserStack = {
      startTunnel: false,
      build: process.env.BROWSERSTACK_BUILD_NAME,
      project: process.env.BROWSERSTACK_PROJECT_NAME,
      tunnelIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
      timeout: 600,
      video: false,
      user: process.env.BROWSERSTACK_USERNAME,
      key: process.env.BROWSERSTACK_ACCESS_KEY,
    };
    configuration.browsers = ['BrowserstackChromeCI'];
    configuration.reporters.push('BrowserStack');
  }

  config.set(configuration);
};
