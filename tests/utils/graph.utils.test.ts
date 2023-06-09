import { FolderMetadata, FolderNode, Route } from '../../src/types';
import {
  buildFolderTreeFromHierarchy,
  flattenRoutes,
  generateFolderHierarchy,
  handleLayoutNodesInGraph,
  mapNodes,
  mapNodesToRoutes
} from '../../src/utils/graph.utils';

describe('graph.utils', () => {
  describe('generateFolderHierarchy', () => {
    it('returns an empty array when folderPaths is empty', () => {
      const result = generateFolderHierarchy([], 'src/pages', []);
      expect(result).toEqual([]);
    });

    it('returns the correct folder hierarchy when folderPaths and filePaths are not empty', () => {
      const folderPaths = [
        'src/pages',
        'src/pages/Teams',
        'src/pages/Teams/[id]',
        'src/pages/Teams/[id]/(team-details)',
        'src/pages/Teams/[id]/history',
        'src/pages/Teams/[id]/[...custom]',
        'src/pages/Products',
        'src/pages/Products/[id]'
      ];

      const baseUrl = 'src/pages';

      const filePaths = [
        'src/pages/dashboard-page.component.ts',
        'src/pages/Teams/team-catalog-page.component.ts',
        'src/pages/Teams/[id]/team-overview-page.component.ts',
        'src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts',
        'src/pages/Teams/[id]/history/team-history-page.component.ts',
        'src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts',
        'src/pages/Products/product-catalog-page.component.ts',
        'src/pages/Products/[id]/product-details-page.component.ts'
      ];

      const expectedOutput = [
        {
          path: '',
          files: ['src/pages/dashboard-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams',
          files: ['src/pages/Teams/team-catalog-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams/[id]',
          files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
          parent: 'Teams'
        },
        {
          path: 'Teams/[id]/(team-details)',
          files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts'],
          parent: 'Teams/[id]'
        },
        {
          path: 'Teams/[id]/history',
          files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'],
          parent: 'Teams/[id]'
        },
        {
          path: 'Teams/[id]/[...custom]',
          files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'],
          parent: 'Teams/[id]'
        },
        {
          path: 'Products',
          files: ['src/pages/Products/product-catalog-page.component.ts'],
          parent: null
        },
        {
          path: 'Products/[id]',
          files: ['src/pages/Products/[id]/product-details-page.component.ts'],
          parent: 'Products'
        }
      ];

      const result = generateFolderHierarchy(folderPaths, baseUrl, filePaths);

      expect(result.length).toEqual(expectedOutput.length);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('buildFolderTreeFromHierarchy', () => {
    it('should return an empty array when the input array is empty', () => {
      const folderNodes: FolderMetadata[] = [];
      const expected: FolderNode[] = [];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });

    it('should correctly build a tree with a single folder node', () => {
      const folderNodes = [
        {
          path: '',
          files: ['src/pages/dashboard-page.component.ts'],
          parent: null
        }
      ];
      const expected = [
        {
          parent: null,
          data: { path: '', files: ['src/pages/dashboard-page.component.ts'] },
          children: []
        }
      ];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });

    it('should add the parent node to its children when children is not empty', () => {
      const folderNodes = [
        {
          path: 'Teams',
          files: ['src/pages/Teams/team-catalog-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams/[id]',
          files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
          parent: 'Teams'
        }
      ];
      const expected = [
        {
          parent: null,
          data: { path: 'Teams', files: [] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: []
            }
          ]
        }
      ];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });

    it('should correctly handle multiple top-level folder nodes', () => {
      const folderNodes = [
        {
          path: '',
          files: ['src/pages/dashboard-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams',
          files: ['src/pages/Teams/team-catalog-page.component.ts'],
          parent: null
        }
      ];
      const expected = [
        {
          parent: null,
          data: { path: '', files: ['src/pages/dashboard-page.component.ts'] },
          children: []
        },
        {
          parent: null,
          data: { path: 'Teams', files: ['src/pages/Teams/team-catalog-page.component.ts'] },
          children: []
        }
      ];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });

    it('should correctly handle two-level nested folder nodes', () => {
      const folderNodes = [
        {
          path: '',
          files: ['src/pages/dashboard-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams',
          files: ['src/pages/Teams/team-catalog-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams/[id]',
          files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
          parent: 'Teams'
        }
      ];
      const expected = [
        {
          parent: null,
          data: { path: '', files: ['src/pages/dashboard-page.component.ts'] },
          children: []
        },
        {
          parent: null,
          data: { path: 'Teams', files: [] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: []
            }
          ]
        }
      ];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });

    it('should correctly handle three-level nested folder nodes', () => {
      const folderNodes = [
        {
          path: '',
          files: ['src/pages/dashboard-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams',
          files: ['src/pages/Teams/team-catalog-page.component.ts'],
          parent: null
        },
        {
          path: 'Teams/[id]',
          files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
          parent: 'Teams'
        },
        {
          path: 'Teams/[id]/(team-details)',
          files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts'],
          parent: 'Teams/[id]'
        },
        {
          path: 'Teams/[id]/history',
          files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'],
          parent: 'Teams/[id]'
        },
        {
          path: 'Teams/[id]/[...custom]',
          files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'],
          parent: 'Teams/[id]'
        }
      ];

      const expected = [
        {
          parent: null,
          data: { path: '', files: ['src/pages/dashboard-page.component.ts'] },
          children: []
        },
        {
          parent: null,
          data: { path: 'Teams', files: [] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: []
              },
              children: [
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]', files: ['src/pages/Teams/[id]/team-overview-page.component.ts'] },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: {
                    path: 'Teams/[id]/(team-details)',
                    files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts']
                  },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]/history', files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'] },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]/[...custom]', files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'] },
                  children: []
                }
              ]
            }
          ]
        }
      ];
      const result = buildFolderTreeFromHierarchy(folderNodes);
      expect(result).toEqual(expected);
    });
  });

  describe('mapNodes', () => {
    const inputNodes = [
      {
        parent: null,
        data: { path: 'Teams', files: ['src/pages/Teams/team-catalog-page.component.ts'] },
        children: [
          {
            parent: 'Teams',
            data: {
              path: 'Teams',
              files: ['src/pages/Teams/team-catalog-page.component.ts']
            },
            children: []
          },
          {
            parent: 'Teams',
            data: {
              path: 'Teams/[id]',
              files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
            },
            children: [
              {
                parent: 'Teams/[id]',
                data: { path: 'Teams/[id]', files: ['src/pages/Teams/[id]/team-overview-page.component.ts'] },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: {
                  path: 'Teams/[id]/(team-details)',
                  files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts']
                },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: { path: 'Teams/[id]/history', files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'] },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: { path: 'Teams/[id]/[...custom]', files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'] },
                children: []
              }
            ]
          }
        ]
      }
    ];

    const inputNodesWithAdditionalAttribute = [
      {
        parent: null,
        data: { path: 'Teams', files: ['src/pages/Teams/team-catalog-page.component.ts'], value: 'added' },
        children: [
          {
            parent: 'Teams',
            data: {
              path: 'Teams',
              files: ['src/pages/Teams/team-catalog-page.component.ts'],
              value: 'added'
            },
            children: []
          },
          {
            parent: 'Teams',
            data: {
              path: 'Teams/[id]',
              files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
              value: 'added'
            },
            children: [
              {
                parent: 'Teams/[id]',
                data: { path: 'Teams/[id]', files: ['src/pages/Teams/[id]/team-overview-page.component.ts'], value: 'added' },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: {
                  path: 'Teams/[id]/(team-details)',
                  files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts'],
                  value: 'added'
                },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: {
                  path: 'Teams/[id]/history',
                  files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'],
                  value: 'added'
                },
                children: []
              },
              {
                parent: 'Teams/[id]',
                data: {
                  path: 'Teams/[id]/[...custom]',
                  files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'],
                  value: 'added'
                },
                children: []
              }
            ]
          }
        ]
      }
    ];

    it('should add a new attribute to the node data', () => {
      const result = mapNodes(inputNodes, (node) => ({
        ...node,
        data: { ...node.data, value: 'added' }
      }));
      expect(result).toEqual(inputNodesWithAdditionalAttribute);
    });

    it('should remove an attribute from the node data', () => {
      const result = mapNodes(inputNodesWithAdditionalAttribute, (node) => {
        const { value, ...data } = node.data;
        return { ...node, data };
      });
      expect(result).toEqual(inputNodes);
    });

    it('should mutate the children from the node', () => {
      const result = mapNodes(inputNodes, (node) => {
        const { data, children } = node;
        const layoutNodeIndex = children.findIndex((child) => child.data.path.match(/\(([^)]+)\)/));

        if (layoutNodeIndex < 0) {
          return node;
        }

        const file = children[layoutNodeIndex].data.file;
        return {
          ...node,
          data: { ...data, file },
          children: [...children.slice(0, layoutNodeIndex), ...children.slice(layoutNodeIndex + 1)]
        };
      });

      const expected = [
        {
          parent: null,
          data: { path: 'Teams', files: ['src/pages/Teams/team-catalog-page.component.ts'] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: [
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]', files: ['src/pages/Teams/[id]/team-overview-page.component.ts'] },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]/history', files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'] },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: { path: 'Teams/[id]/[...custom]', files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'] },
                  children: []
                }
              ]
            }
          ]
        }
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('flattenRoutes', () => {
    it('should return an empty array for an empty input', () => {
      const input: Route[] = [];
      const expected: Pick<Route, 'component' | 'file' | 'route'>[] = [];
      const result = flattenRoutes(input);
      expect(result).toEqual(expected);
    });

    it('should return an array with a single route for a single node', () => {
      const input = [{ component: 'AppComponent', file: 'app.component.ts', route: '', children: [] }];
      const expected = [{ component: 'AppComponent', file: 'app.component.ts', route: '' }];
      const result = flattenRoutes(input);
      expect(result).toEqual(expected);
    });

    it('should return an array of flattened routes for nested nodes', () => {
      const input = [
        {
          component: 'AppComponent',
          file: 'app.component.ts',
          route: '',
          children: [
            {
              component: 'PagesComponent',
              file: 'pages.component.ts',
              route: 'pages',
              children: [{ component: 'TeamsComponent', file: 'teams.component.ts', route: 'teams', children: [] }]
            }
          ]
        }
      ];
      const expected = [
        { component: 'AppComponent', file: 'app.component.ts', route: '' },
        { component: 'PagesComponent', file: 'pages.component.ts', route: 'pages' },
        { component: 'TeamsComponent', file: 'teams.component.ts', route: 'teams' }
      ];
      const result = flattenRoutes(input);
      expect(result).toEqual(expected);
    });
  });

  describe('handleLayoutNodesInGraph', () => {
    it('should return the routes graph when not layout nodes are present', () => {
      const routeGraph = [
        {
          parent: null,
          data: { path: 'Teams', files: [] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: []
            }
          ]
        }
      ];

      const result = handleLayoutNodesInGraph(routeGraph);

      expect(result).toEqual(routeGraph);
    });
    it('should handle layout nodes from routes graph', () => {
      const routeGraph = [
        {
          parent: null,
          data: { path: 'Teams', files: [] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: '',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: '(team-details)',
                files: ['src/pages/Teams/(team-details)/team-details-layout.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: []
            }
          ]
        }
      ];

      const expectedOutput = [
        {
          parent: null,
          data: { path: 'Teams', files: ['src/pages/Teams/(team-details)/team-details-layout.component.ts'] },
          children: [
            {
              parent: 'Teams',
              data: {
                path: '',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
              },
              children: []
            }
          ]
        }
      ];

      const result = handleLayoutNodesInGraph(routeGraph);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('mapNodesToRoutes', () => {
    it('should return a single route for a single node', () => {
      const input = [
        {
          parent: null,
          data: {
            path: '',
            files: ['src/pages/dashboard-page.component.ts']
          },
          children: []
        }
      ];
      const expected = [
        {
          component: 'DashboardPageComponent',
          file: 'src/pages/dashboard-page.component.ts',
          providers: undefined,
          providersFile: undefined,
          route: '',
          children: []
        }
      ];
      const result = mapNodesToRoutes(input);
      expect(result).toEqual(expected);
    });

    it('should return a tree of routes for nested nodes', () => {
      const input = [
        {
          parent: null,
          data: {
            path: 'Teams',
            files: []
          },
          children: [
            {
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts']
              },
              parent: 'Teams',
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: ['src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts']
              },
              children: [
                {
                  data: {
                    path: 'Teams/[id]',
                    files: ['src/pages/Teams/[id]/team-overview-page.component.ts']
                  },
                  parent: 'Teams/[id]',
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: {
                    path: 'Teams/[id]/history',
                    files: ['src/pages/Teams/[id]/history/team-history-page.component.ts']
                  },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: {
                    path: 'Teams/[id]/[...custom]',
                    files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts']
                  },
                  children: []
                }
              ]
            }
          ]
        }
      ];
      const expected = [
        {
          route: 'Teams',
          component: undefined,
          file: undefined,
          providers: undefined,
          providersFile: undefined,
          children: [
            {
              component: 'TeamCatalogPageComponent',
              file: 'src/pages/Teams/team-catalog-page.component.ts',
              providers: undefined,
              providersFile: undefined,
              route: '',
              children: []
            },
            {
              component: 'TeamDetailsLayoutComponent',
              file: 'src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts',
              providers: undefined,
              providersFile: undefined,
              route: ':id',
              children: [
                {
                  component: 'TeamOverviewPageComponent',
                  file: 'src/pages/Teams/[id]/team-overview-page.component.ts',
                  providers: undefined,
                  providersFile: undefined,
                  route: '',
                  children: []
                },
                {
                  component: 'TeamHistoryPageComponent',
                  file: 'src/pages/Teams/[id]/history/team-history-page.component.ts',
                  providers: undefined,
                  providersFile: undefined,
                  route: 'history',
                  children: []
                },
                {
                  component: 'TeamCustomPageComponent',
                  file: 'src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts',
                  providers: undefined,
                  providersFile: undefined,
                  route: '**',
                  children: []
                }
              ]
            }
          ]
        }
      ];

      const result = mapNodesToRoutes(input);
      expect(result).toEqual(expected);
    });
  });
});
