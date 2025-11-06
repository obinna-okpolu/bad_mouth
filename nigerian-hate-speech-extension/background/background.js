const ClassifierAPI = {
  useToyClassifier: true,
  async classify(text) {
    if (this.useToyClassifier) {
      const keywords = ['badword1', 'example', 'hate'];
      const found = keywords.some(word => text.toLowerCase().includes(word));
      return { label: found ? 'hate' : 'clean', confidence: found ? 0.9 : 0.98 };
    } else {
      // Simulate a network request
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ label: 'clean', confidence: 0.98 });
        }, 500);
      });
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLASSIFY_TEXT') {
    ClassifierAPI.classify(message.payload.text).then(result => {
      sendResponse(result);
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
