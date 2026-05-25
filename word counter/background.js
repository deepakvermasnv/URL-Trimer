chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "countWords",
    title: "Count Words & Characters",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "countWords") {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_COUNT",
      text: info.selectionText,
      x: 200,
      y: 150
    });
  }
});
