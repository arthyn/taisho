import { shell } from 'electron';
import contextMenu from 'electron-context-menu';

//Taken from https://github.com/nativefier/nativefier/blob/master/app/src/components/contextMenu.ts
export function initContextMenu(createNewWindow, createNewTab, mainUrl, window?): void {
  const options: contextMenu.Options = {
    showInspectElement: false,
    prepend: (actions, params) => {
      const items = [];
      const showOpenLink = !params.pageURL.startsWith(mainUrl)

      if (params.linkURL && showOpenLink) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            shell.openExternal(params.linkURL);
          },
        });
        items.push({
          label: 'Open Link in New Window',
          click: () => {
            createNewWindow(params.linkURL);
          },
        });
        if (createNewTab) {
          items.push({
            label: 'Open Link in New Tab',
            click: () => {
              createNewTab(params.linkURL, false);
            },
          });
        }
      }
      return items;
    },
  };

  if (window) {
    (options.window as any) = window;
  }

  contextMenu(options);
}
