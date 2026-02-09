document.addEventListener('DOMContentLoaded', () => {
  const executeBtn = document.getElementById('executeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveBtn = document.getElementById('saveBtn');
  const radioGroup = document.getElementById('radioGroup');
  const rolesContainer = document.getElementById('rolesContainer');
  const addRoleBtn = document.getElementById('addRoleBtn');
  const autoLoginCheckbox = document.getElementById('autoLogin');

  let roles = [];
  let selectedRoleId = null;

  // Генерация уникального ID для роли
  function generateRoleId() {
    return 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Создание блока роли
  function createRoleBlock(role) {
    const roleBlock = document.createElement('div');
    roleBlock.className = 'role-block';
    roleBlock.dataset.roleId = role.id;
    
    roleBlock.innerHTML = `
      <div class="role-header">
        <input type="text" class="role-login" value="${role.login || ''}" placeholder="Логин">
      </div>
      <div class="role-password-block">
        <input type="password" class="role-password" value="${role.password || ''}" placeholder="Пароль">
      </div>
      <button type="button" class="btn-remove-role" title="Удалить роль">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Обработчик удаления роли
    const removeBtn = roleBlock.querySelector('.btn-remove-role');
    removeBtn.addEventListener('click', () => {
      removeRole(role.id);
    });
    
    // Обновление радиобаттона при изменении логина
    const loginInput = roleBlock.querySelector('.role-login');
    loginInput.addEventListener('input', () => {
      // Обновляем логин в объекте роли
      role.login = loginInput.value.trim();
      updateRadioButtons();
    });
    
    return roleBlock;
  }

  // Создание радиобаттона для роли
  function createRadioButton(role) {
    const label = document.createElement('label');
    label.className = 'radio-label';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'role';
    radio.value = role.id;
    radio.id = `role_${role.id}`;
    if (selectedRoleId === role.id) {
      radio.checked = true;
    }
    
    const span = document.createElement('span');
    // Берем логин из DOM, если блок уже создан, иначе из объекта роли
    const roleBlock = document.querySelector(`[data-role-id="${role.id}"]`);
    if (roleBlock) {
      const loginInput = roleBlock.querySelector('.role-login');
      span.textContent = loginInput ? loginInput.value.trim() || 'Новая запись' : (role.login || 'Новая запись');
    } else {
      span.textContent = role.login || 'Новая запись';
    }
    
    label.appendChild(radio);
    label.appendChild(span);
    
    radio.addEventListener('change', () => {
      if (radio.checked) {
        selectedRoleId = role.id;
      }
    });
    
    return label;
  }

  // Обновление радиобаттонов
  function updateRadioButtons() {
    radioGroup.innerHTML = '';
    roles.forEach(role => {
      const radioBtn = createRadioButton(role);
      radioGroup.appendChild(radioBtn);
    });
  }

  // Обновление блоков ролей
  function updateRolesContainer() {
    rolesContainer.innerHTML = '';
    roles.forEach(role => {
      const roleBlock = createRoleBlock(role);
      rolesContainer.appendChild(roleBlock);
    });
  }

  // Добавление новой роли
  function addRole() {
    const newRole = {
      id: generateRoleId(),
      login: '',
      password: ''
    };
    roles.push(newRole);
    selectedRoleId = newRole.id;
    updateRadioButtons();
    updateRolesContainer();
  }

  // Удаление роли
  function removeRole(roleId) {
    if (roles.length <= 1) {
      alert('Должна быть хотя бы одна роль');
      return;
    }
    
    roles = roles.filter(r => r.id !== roleId);
    
    // Если удалена выбранная роль, выбираем первую
    if (selectedRoleId === roleId) {
      selectedRoleId = roles.length > 0 ? roles[0].id : null;
    }
    
    updateRadioButtons();
    updateRolesContainer();
  }

  // Сохранение данных ролей из DOM
  function saveRolesFromDOM() {
    roles.forEach(role => {
      const roleBlock = document.querySelector(`[data-role-id="${role.id}"]`);
      if (roleBlock) {
        const loginInput = roleBlock.querySelector('.role-login');
        const passwordInput = roleBlock.querySelector('.role-password');
        role.login = loginInput.value.trim();
        role.password = passwordInput.value.trim();
      }
    });
  }

  // Загружаем сохраненные настройки
  chrome.storage.sync.get(['roles', 'selectedRoleId', 'autoLogin'], (result) => {
    // Инициализация ролей по умолчанию
    if (result.roles && result.roles.length > 0) {
      roles = result.roles;
    } else {
      roles = [
        { id: generateRoleId(), login: 'admin', password: 'admin123' },
        { id: generateRoleId(), login: 'mbos', password: '' }
      ];
    }
    
    selectedRoleId = result.selectedRoleId || (roles.length > 0 ? roles[0].id : null);
    autoLoginCheckbox.checked = result.autoLogin || false;
    
    updateRadioButtons();
    updateRolesContainer();
  });

  // Переключение видимости настроек
  settingsBtn.addEventListener('click', () => {
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
    settingsBtn.textContent = isVisible ? 'Настройки' : 'Скрыть настройки';
    
    // Изменяем размер виджета
    if (isVisible) {
      document.documentElement.classList.remove('expanded');
    } else {
      document.documentElement.classList.add('expanded');
    }
  });

  // Добавление новой роли
  addRoleBtn.addEventListener('click', () => {
    addRole();
  });

  // Сохранение настроек
  saveBtn.addEventListener('click', () => {
    saveRolesFromDOM();
    
    const settings = {
      roles: roles,
      selectedRoleId: selectedRoleId,
      autoLogin: autoLoginCheckbox.checked
    };

    const originalText = saveBtn.textContent;
    
    chrome.storage.sync.set(settings, () => {
      // Временно меняем текст кнопки
      saveBtn.textContent = '✓ Сохранено успешно';
      saveBtn.style.backgroundColor = '#34c759';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '';
      }, 600);
    });
  });

  executeBtn.addEventListener('click', async () => {
    try {
      // Сохраняем данные из DOM перед выполнением
      saveRolesFromDOM();
      
      // Получаем текущую вкладку
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Получаем настройки
      const settings = await chrome.storage.sync.get(['roles', 'selectedRoleId', 'autoLogin']);
      
      // Находим выбранную роль
      const selectedRole = settings.roles?.find(r => r.id === settings.selectedRoleId) || 
                          (settings.roles && settings.roles.length > 0 ? settings.roles[0] : null);
      
      if (!selectedRole) {
        alert('Не выбрана роль');
        return;
      }

      const payload = {
        loginValue: selectedRole.login || '',
        passwordValue: selectedRole.password || '',
        autoLogin: settings.autoLogin || false
      };

      const isLoginPage = tab.url && tab.url.toLowerCase().includes('/login');

      if (isLoginPage) {
        // Уже на странице /login — только заполняем форму и нажимаем «Далее»
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: executeOnLoginPage,
          args: [payload]
        });
      } else {
        // Не на /login — полный сценарий: очистка, перезагрузка, заполнение, редирект
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: executeMainFunction,
          args: [payload, tab.url]
        });
      }

      // Закрываем popup
      window.close();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка: ' + error.message);
    }
  });
});

// Функция для страницы /login: только заполнение формы и нажатие «Далее», без перезагрузки и редиректа
function executeOnLoginPage(settings) {
  const loginFieldName = 'Логин';
  const passwordFieldName = 'Пароль';
  const loginValue = settings.loginValue || '';
  const passwordValue = settings.passwordValue || '';

  function findField(fieldName, isPassword) {
    const allInputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const fieldNameLower = fieldName.toLowerCase();
    for (const input of allInputs) {
      if (isPassword && input.type !== 'password') continue;
      if (!isPassword && input.type === 'password') continue;
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const label = (input.labels?.[0]?.textContent || '').toLowerCase();
      if (name.includes(fieldNameLower) || id.includes(fieldNameLower) ||
          placeholder.includes(fieldNameLower) || ariaLabel.includes(fieldNameLower) || label.includes(fieldNameLower)) {
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

  function findNextButton() {
    const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'));
    for (const button of allButtons) {
      const text = (button.textContent || button.innerText || '').trim();
      const value = (button.value || '').trim();
      if (text.toLowerCase().includes('далее') || value.toLowerCase().includes('далее')) return button;
    }
    const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
    for (const button of submitButtons) {
      if ((button.className || '').includes('btn') || button.classList.toString().includes('btn')) {
        const text = (button.textContent || button.innerText || '').trim();
        if (!text || text.toLowerCase().includes('далее')) return button;
      }
    }
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      const btn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (btn) return btn;
    }
    return null;
  }

  const loginField = findField(loginFieldName, false);
  if (loginField) setFieldValue(loginField, loginValue);
  const passwordField = findField(passwordFieldName, true);
  if (passwordField) setFieldValue(passwordField, passwordValue);

  if (settings.autoLogin) {
    setTimeout(() => {
      const btn = findNextButton();
      if (btn && !btn.disabled) btn.click();
    }, 300);
  }
}

// Функция, которая выполняется на странице (не /login): очистка, перезагрузка, затем content.js заполнит форму и сделает редирект
function executeMainFunction(settings, originalUrl) {
  localStorage.clear();

  const loginValue = settings.loginValue || '';
  const passwordValue = settings.passwordValue || '';

  sessionStorage.setItem('storageClearerSettings', JSON.stringify({
    loginFieldName: 'Логин',
    passwordFieldName: 'Пароль',
    loginValue,
    passwordValue,
    autoLogin: settings.autoLogin || false,
    originalUrl: originalUrl
  }));

  window.location.reload();
}
