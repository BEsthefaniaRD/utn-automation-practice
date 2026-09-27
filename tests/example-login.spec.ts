import { test, expect } from '@playwright/test'; 

test('Go to the Sauce Demo website', async ({ page }) => { 
    await page.goto('https://www.saucedemo.com/'); 
    await expect(page).toHaveTitle('Swag Labs'); 
}); 

test('Login with valid credentials', async ({ page }) => { 
    await page.goto('https://www.saucedemo.com/'); 
    await page.fill('#user-name', 'standard_user'); 
    await page.fill('#password', 'secret_sauce'); 
    await page.click('#login-button'); 
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html'); 
});

test('Login with invalid credentials', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'invalid_user');  
    await page.fill('#password', 'invalid_password');
    await page.click('#login-button');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    //await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});
