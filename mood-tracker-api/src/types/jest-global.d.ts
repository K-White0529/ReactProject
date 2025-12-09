/// <reference types="jest" />

// Jestのグローバル型定義をプロジェクト全体で使用可能にする
declare global {
  var describe: jest.Describe;
  var it: jest.It;
  var test: jest.It;
  var expect: jest.Expect;
  var beforeAll: jest.Lifecycle;
  var afterAll: jest.Lifecycle;
  var beforeEach: jest.Lifecycle;
  var afterEach: jest.Lifecycle;
}

export {};
