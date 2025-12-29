document.addEventListener('DOMContentLoaded', () => {
  const executeBtn = document.getElementById('executeBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  executeBtn.addEventListener('click', async () => {
    try {
      // Получаем текущую вкладку
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Получаем настройки
      const settings = await chrome.storage.sync.get([
        'loginFieldName',
        'passwordFieldName',
        'loginValue',
        'passwordValue',
        'autoLogin'
      ]);

      // Выполняем скрипт на странице
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: executeMainFunction,
        args: [settings]
      });

      // Закрываем popup
      window.close();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка: ' + error.message);
    }
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

// Функция, которая выполняется на странице
function executeMainFunction(settings) {
  // Очищаем localStorage
  localStorage.clear();
  
  // Получаем настройки с дефолтными значениями
  const loginFieldName = settings.loginFieldName || 'Логин';
  const passwordFieldName = settings.passwordFieldName || 'Пароль';
  const loginValue = settings.loginValue || 'admin';
  const passwordValue = settings.passwordValue || 'admin123';

  // Сохраняем настройки в sessionStorage для использования после перезагрузки
  // content.js будет использовать эти настройки для заполнения формы
  sessionStorage.setItem('storageClearerSettings', JSON.stringify({
    loginFieldName,
    passwordFieldName,
    loginValue,
    passwordValue,
    autoLogin: settings.autoLogin || false
  }));

  // Перезагружаем страницу
  window.location.reload();
}

