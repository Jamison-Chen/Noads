chrome.runtime.sendMessage({ action: "contentScriptReady" });

let isEnabled = true;

const removeAds = (selectors: string[]): void => {
    if (!isEnabled) return;
    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
    });
};

const initAdBlocker = (selectors: string[]): void => {
    if (!isEnabled) return;
    removeAds(selectors);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") removeAds(selectors);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

chrome.storage.sync.get(["selectors", "enabled"], (result) => {
    if (
        result.selectors &&
        result.selectors.length > 0 &&
        result.enabled !== false
    ) {
        initAdBlocker(result.selectors);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleExtension") {
        isEnabled = message.enabled;
        if (isEnabled) {
            chrome.storage.sync.get(["selectors"], (result) => {
                if (result.selectors && result.selectors.length > 0) {
                    initAdBlocker(result.selectors);
                }
            });
        }
    }
});
