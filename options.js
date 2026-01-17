document.addEventListener('DOMContentLoaded', () => {
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
});
