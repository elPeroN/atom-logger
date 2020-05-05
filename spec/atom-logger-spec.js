'use babel';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AtomLogger', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('atom-logger');
  });

  describe('when the atom-logger:dashboard event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // After activation of package the view is on the DOM
      expect(workspaceElement.querySelector('.atom-logger')).toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-logger:dashboard');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        let atomLoggerElement = workspaceElement.querySelector('.atom-logger');
        expect(atomLoggerElement).toExist();

        let atomLoggerPanel = atom.workspace.panelForItem(atomLoggerElement);
        expect(atomLoggerPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-logger:dashboard');
        expect(atomLoggerPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-logger:dashboard');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let atomLoggerElement = workspaceElement.querySelector('.atom-logger');
        expect(atomLoggerElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-logger:dashboard');
        expect(atomLoggerElement).not.toBeVisible();
      });
    });
  });
});
