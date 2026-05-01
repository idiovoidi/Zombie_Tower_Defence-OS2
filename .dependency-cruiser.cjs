/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You need to refactor to end the circular dependency.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used. Consider removing it or adding it to an index file.",
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|ts|cjs|mjs)$', // dot files
          '(^|/)_[^/]+\.(js|ts|cjs|mjs)$', // underscore prefixed files
          '.*\.d\.ts$', // TypeScript declaration files
          '(^|/)__mocks__/', // Jest mocks
          '(^|/)tests/', // Test files
          '(^|/)vite\.config\.', // Vite config
          '(^|/)vitest\.config\.', // Vitest config
          '(^|/)eslint\.config\.', // ESLint config
        ],
      },
      to: {},
    },
    {
      name: 'not-to-test',
      comment:
        "This module depends on test files. Don't do this - production code shouldn't depend on tests.",
      severity: 'error',
      from: {
        pathNot: '(^|/)tests/',
      },
      to: {
        path: '(^|/)tests/',
      },
    },
    {
      name: 'not-to-spec',
      comment:
        'This module depends on a spec (test) file. The identifier "spec" is typically used for test files, so this looks like a dependency on a test file.',
      severity: 'error',
      from: {},
      to: {
        path: '\\.spec\\.(js|ts|cjs|mjs)$',
      },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        "This module depends on an npm package from the 'devDependencies' section of your package.json. It looks like an unused (or uninstalled) npm package, or a production dependency that should be in 'dependencies' instead of 'devDependencies'.",
      from: {
        path: '(^|/)src/',
        pathNot: '(^|/)tests/',
      },
      to: {
        dependencyTypes: ['npm-dev'],
      },
    },
    {
      name: 'optional-undocumented',
      from: {
        path: '(^|/)src/',
      },
      to: {
        dependencyTypes: ['npm-optional'],
        pathNot: ['node_modules/'],
      },
    },
    {
      name: 'no-deprecated-core',
      comment:
        'A module depends on a node core module that has been deprecated. Find an alternative - these are bound to disappear and usually break with major node releases.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: '^(punycode|domain|constants|sys|_linklist|_stream)$',
      },
    },
    {
      name: 'no-deprecated-npm',
      comment:
        'This module uses a deprecated npm package. Find an alternative.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['npm'],
        path: [
          '^(lodash\\.)',
          '^underscore$',
        ],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. It's likely that this dependency will not be available in production.",
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm module: add it to your package.json. In all other cases you likely need to correct an import statement or install additional dependencies.",
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-duplicate-dep-types',
      comment:
        "Likeley this module depends on an external ('npm') package that occurs more than once in your package.json i.e. bot as peer- and dev-dependency. This will cause maintenance issues later on.",
      severity: 'warn',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg'],
    },
    moduleSystems: ['es6', 'cjs', 'amd', 'tsd'],
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            rankdir: 'TB',
          },
        },
      },
      archi: {
        collapsePattern: '^(packages|src|test|spec|lib|app|bin)/[^/]+|node_modules/[^/]+',
      },
    },
  },
};
