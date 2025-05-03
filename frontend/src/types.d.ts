// Global type declarations for test environment
declare function describe(description: string, specDefinitions: () => void): void;
declare function beforeEach(action: () => void): void;
declare function beforeEach(action: (done: DoneFn) => void): void;
declare function afterEach(action: () => void): void;
declare function it(expectation: string, assertion: () => void): void;
declare function it(expectation: string, assertion: (done: DoneFn) => void): void;
declare function expect<T>(actual: T): jasmine.Matchers<T>;
declare function spyOn<T>(object: T, method: keyof T): jasmine.Spy;

interface DoneFn {
  (): void;
  fail(message?: string): void;
}
