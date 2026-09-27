import { test } from '../fixtures/pages';
import { users, errorMessages } from '../test-data/saucedemo';

test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
});

test('Go to the Sauce Demo website', async ({ loginPage }) => {
    await loginPage.expectTitleToContain('Swag Labs');
});

test('Login with valid credentials', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectToBeOpen();
});

test('Login with invalid credentials', async ({ loginPage }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectErrorMessage(errorMessages.invalidCredentials);
});
