document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('login-root');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/login';
    form.className = 'login-form';

    // Username/email field
    const usernameGroup = document.createElement('div');
    usernameGroup.className = 'form-group';
    const usernameLabel = document.createElement('label');
    usernameLabel.htmlFor = 'username';
    usernameLabel.textContent = 'Username or Email';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.name = 'username';
    usernameInput.required = true;
    usernameInput.placeholder = 'Enter your username or email';
    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameInput);

    // Password field
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';
    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'password';
    passwordLabel.textContent = 'Password';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.name = 'password';
    passwordInput.required = true;
    passwordInput.placeholder = 'Enter your password';
    passwordGroup.appendChild(passwordLabel);
    passwordGroup.appendChild(passwordInput);

    // Role selector
    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    const roleLabel = document.createElement('label');
    roleLabel.htmlFor = 'role';
    roleLabel.textContent = 'Login as';
    const roleSelect = document.createElement('select');
    roleSelect.id = 'role';
    roleSelect.name = 'role';
    roleSelect.required = true;
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Select role';
    const studentOption = document.createElement('option');
    studentOption.value = 'student';
    studentOption.textContent = 'Student';
    const adminOption = document.createElement('option');
    adminOption.value = 'admin';
    adminOption.textContent = 'Admin';
    roleSelect.appendChild(defaultOption);
    roleSelect.appendChild(studentOption);
    roleSelect.appendChild(adminOption);
    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleSelect);

    // Submit button
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'form-actions';
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Login';
    actionsDiv.appendChild(submitBtn);

    // Append all to form
    form.appendChild(usernameGroup);
    form.appendChild(passwordGroup);
    form.appendChild(roleGroup);
    form.appendChild(actionsDiv);

    // Back to home link
    const backLink = document.createElement('p');
    const anchor = document.createElement('a');
    anchor.href = '/';
    anchor.textContent = 'Back to Home';
    backLink.appendChild(anchor);

    root.appendChild(form);
    root.appendChild(backLink);
});
