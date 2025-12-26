// Скрипт, который выполняется на каждой странице
// Заполняет форму после перезагрузки, если это было инициировано расширением

window.addEventListener('load', () => {
  const settingsStr = sessionStorage.getItem('storageClearerSettings');
  if (settingsStr) {
    try {
      const settings = JSON.parse(settingsStr);
      sessionStorage.removeItem('storageClearerSettings');
      
      setTimeout(() => {
        fillFormFields(settings);
      }, 500);
    } catch (e) {
      console.error('Ошибка при парсинге настроек:', e);
    }
  }
});

function fillFormFields(settings) {
  const loginFieldName = settings.loginFieldName || 'Логин';
  const passwordFieldName = settings.passwordFieldName || 'Пароль';
  const loginValue = settings.loginValue || 'admin';
  const passwordValue = settings.passwordValue || 'admin123';

  // Ищем поле логина
  const loginField = findField(loginFieldName, false);
  if (loginField) {
    setFieldValue(loginField, loginValue);
  }

  // Ищем поле пароля
  const passwordField = findField(passwordFieldName, true);
  if (passwordField) {
    setFieldValue(passwordField, passwordValue);
  }
}

function findField(fieldName, isPassword) {
  const allInputs = Array.from(document.querySelectorAll('input, textarea, select'));
  
  for (const input of allInputs) {
    if (isPassword && input.type !== 'password') {
      continue;
    }
    if (!isPassword && input.type === 'password') {
      continue;
    }

    // Проверяем различные атрибуты
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    const label = (input.labels?.[0]?.textContent || '').toLowerCase();
    const fieldNameLower = fieldName.toLowerCase();

    if (name.includes(fieldNameLower) ||
        id.includes(fieldNameLower) ||
        placeholder.includes(fieldNameLower) ||
        ariaLabel.includes(fieldNameLower) ||
        label.includes(fieldNameLower)) {
      return input;
    }
  }
  
  return null;
}

function setFieldValue(field, value) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
}

