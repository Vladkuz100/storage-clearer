document.addEventListener('DOMContentLoaded', () => {
  const executeBtn = document.getElementById('executeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  
  const loginFieldNameInput = document.getElementById('loginFieldName');
  const passwordFieldNameInput = document.getElementById('passwordFieldName');
  const loginValueInput = document.getElementById('loginValue');
  const passwordValueInput = document.getElementById('passwordValue');
  const autoLoginCheckbox = document.getElementById('autoLogin');

  // Загружаем сохраненные настройки
  chrome.storage.sync.get([
    'loginFieldName',
    'passwordFieldName',
    'loginValue',
    'passwordValue',
    'autoLogin'
  ], (result) => {
    loginFieldNameInput.value = result.loginFieldName || 'Логин';
    passwordFieldNameInput.value = result.passwordFieldName || 'Пароль';
    loginValueInput.value = result.loginValue || 'admin';
    passwordValueInput.value = result.passwordValue || 'admin123';
    autoLoginCheckbox.checked = result.autoLogin || false;
  });

  // Переключение видимости настроек
  settingsBtn.addEventListener('click', () => {
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
    settingsBtn.textContent = isVisible ? 'Настройки' : 'Скрыть настройки';
  });

  // Сохранение настроек
  saveBtn.addEventListener('click', () => {
    const settings = {
      loginFieldName: loginFieldNameInput.value.trim() || 'Логин',
      passwordFieldName: passwordFieldNameInput.value.trim() || 'Пароль',
      loginValue: loginValueInput.value.trim() || 'admin',
      passwordValue: passwordValueInput.value.trim() || 'admin123',
      autoLogin: autoLoginCheckbox.checked
    };

    chrome.storage.sync.set(settings, () => {
      statusDiv.textContent = 'Настройки сохранены!';
      statusDiv.className = 'status-message success';
      
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
      }, 2000);
    });
  });

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

