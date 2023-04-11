import { FolderMetadata, FolderNode } from '../../src/types';
import { buildFolderTreeFromHierarchy, generateFolderHierarchy, mapNodes, mapNodesToRoutes } from '../../src/utils/graph.utils';

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

  describe('mapNodesToRoutes', () => {
    it('should return a single route for a single node', () => {
      const input = [
        {
          parent: null,
          data: {
            path: '',
            files: ['src/pages/dashboard-page.component.ts'],
            file: 'src/pages/dashboard-page.component.ts',
            component: 'DashboardPageComponent',
            route: ''
          },
          children: []
        }
      ];
      const expected = [
        {
          component: 'DashboardPageComponent',
          file: 'src/pages/dashboard-page.component.ts',
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
            files: [],
            route: 'Teams'
          },
          children: [
            {
              data: {
                path: 'Teams',
                files: ['src/pages/Teams/team-catalog-page.component.ts'],
                route: '',
                file: 'src/pages/Teams/team-catalog-page.component.ts',
                component: 'TeamCatalogPageComponent'
              },
              parent: 'Teams',
              children: []
            },
            {
              parent: 'Teams',
              data: {
                path: 'Teams/[id]',
                files: [],
                route: ':id',
                file: 'src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts',
                component: 'TeamDetailsLayoutComponent'
              },
              children: [
                {
                  data: {
                    path: 'Teams/[id]',
                    files: ['src/pages/Teams/[id]/team-overview-page.component.ts'],
                    route: '',
                    file: 'src/pages/Teams/[id]/team-overview-page.component.ts',
                    component: 'TeamOverviewPageComponent'
                  },
                  parent: 'Teams/[id]',
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: {
                    path: 'Teams/[id]/history',
                    files: ['src/pages/Teams/[id]/history/team-history-page.component.ts'],
                    route: 'history',
                    file: 'src/pages/Teams/[id]/history/team-history-page.component.ts',
                    component: 'TeamHistoryPageComponent'
                  },
                  children: []
                },
                {
                  parent: 'Teams/[id]',
                  data: {
                    path: 'Teams/[id]/[...custom]',
                    files: ['src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts'],
                    route: '*',
                    file: 'src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts',
                    component: 'TeamCustomPageComponent'
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
          children: [
            {
              component: 'TeamCatalogPageComponent',
              file: 'src/pages/Teams/team-catalog-page.component.ts',
              route: '',
              children: []
            },
            {
              component: 'TeamDetailsLayoutComponent',
              file: 'src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts',
              route: ':id',
              children: [
                {
                  component: 'TeamOverviewPageComponent',
                  file: 'src/pages/Teams/[id]/team-overview-page.component.ts',
                  route: '',
                  children: []
                },
                {
                  component: 'TeamHistoryPageComponent',
                  file: 'src/pages/Teams/[id]/history/team-history-page.component.ts',
                  route: 'history',
                  children: []
                },
                {
                  component: 'TeamCustomPageComponent',
                  file: 'src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts',
                  route: '*',
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