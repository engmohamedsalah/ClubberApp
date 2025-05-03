// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Declare the globals for Jasmine test environment
declare global {
  const describe: typeof jasmine.describe;
  const it: typeof jasmine.it;
  const expect: jasmine.Matchers<any>;
  const beforeEach: typeof jasmine.beforeEach;
  const afterEach: typeof jasmine.afterEach;
  const spyOn: typeof jasmine.spyOn;
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
