document.addEventListener('DOMContentLoaded', () => {
  const loginFieldNameInput = document.getElementById('loginFieldName');
  const passwordFieldNameInput = document.getElementById('passwordFieldName');
  const loginValueInput = document.getElementById('loginValue');
  const passwordValueInput = document.getElementById('passwordValue');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Загружаем сохраненные настройки
  chrome.storage.sync.get([
    'loginFieldName',
    'passwordFieldName',
    'loginValue',
    'passwordValue'
  ], (result) => {
    loginFieldNameInput.value = result.loginFieldName || 'Логин';
    passwordFieldNameInput.value = result.passwordFieldName || 'Пароль';
    loginValueInput.value = result.loginValue || 'admin';
    passwordValueInput.value = result.passwordValue || 'admin123';
  });

  // Сохранение настроек
  saveBtn.addEventListener('click', () => {
    const settings = {
      loginFieldName: loginFieldNameInput.value.trim() || 'Логин',
      passwordFieldName: passwordFieldNameInput.value.trim() || 'Пароль',
      loginValue: loginValueInput.value.trim() || 'admin',
      passwordValue: passwordValueInput.value.trim() || 'admin123'
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
});

