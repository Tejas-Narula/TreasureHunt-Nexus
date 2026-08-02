# Plan: Login Page Routing Separation

## Overview
Currently, the `LoginPage.tsx` acts as a welcome screen (home page) with a simple `enter.png` button, while the actual login form inputs (Team ID & Phone Number) and the fetch API logic are hidden/commented out. 

The goal is to create a true `/login` (credentials) page that contains the hidden input fields and the fetch logic, acting as an intermediary step between the welcome screen and the main application (mission).

## Project Type
**WEB** (React frontend)

## Success Criteria
- The initial welcome screen only has the background, logo, and "ENTER HAWKINS" button.
- Clicking "ENTER" routes the user to the actual login form.
- The actual login form contains the Team ID and Phone Number inputs.
- The login form executes the authentication fetch request (`/api/player/login`).
- Successful authentication routes the user to the `waiting` or `mission` state as before.

## Tech Stack
- React (Vite)
- Tailwind CSS
- TypeScript

## File Structure
```
frontend/
├── src/
│   ├── App.tsx                     # Manage new routing state
│   ├── components/
│   │   ├── WelcomePage.tsx         # (NEW) The splash screen with the ENTER button
│   │   ├── LoginPage.tsx           # (MODIFIED) The actual form with inputs and fetch
```

## Task Breakdown

### Task 1: Create `WelcomePage.tsx`
- **Agent**: `frontend-specialist`
- **Skill**: `react-best-practices`
- **Priority**: P1
- **Dependencies**: None
- **INPUT→OUTPUT→VERIFY**: 
  - **Input**: The current UI of `LoginPage.tsx` (background, logo, `enter.png` button).
  - **Output**: A new component `WelcomePage.tsx` containing the splash screen UI. It will take an `onEnter` prop to proceed.
  - **Verify**: The component renders the exact same splash screen UI as currently seen on load.

### Task 2: Restore `LoginPage.tsx` to a Login Form
- **Agent**: `frontend-specialist`
- **Skill**: `react-best-practices`
- **Priority**: P1
- **Dependencies**: Task 1
- **INPUT→OUTPUT→VERIFY**: 
  - **Input**: The commented-out form fields and `executeLogin` fetch call in `LoginPage.tsx`.
  - **Output**: `LoginPage.tsx` updated to show the Team ID and Phone Number inputs, the submit button, and execute the API call on submit. It will receive `onLoginSuccess` and `onNavigateHome` props.
  - **Verify**: The form renders correctly with inputs, and submitting it triggers the API call.

### Task 3: Update Routing in `App.tsx`
- **Agent**: `frontend-specialist`
- **Skill**: `react-best-practices`
- **Priority**: P1
- **Dependencies**: Task 1, Task 2
- **INPUT→OUTPUT→VERIFY**: 
  - **Input**: `App.tsx` state `activeTab`.
  - **Output**: Add a new tab state (e.g., `'welcome'`) which renders `WelcomePage`. When `onEnter` is triggered, set `activeTab` to `'login'`, which then renders the restored `LoginPage`.
  - **Verify**: User loads into `'welcome'`, clicks ENTER, transitions to `'login'`, enters credentials, and transitions to game state.

## ✅ Phase X: Verification
- [ ] Lint: `npm run lint` & `npx tsc --noEmit`
- [ ] Build: `npm run build`
- [ ] User testing: Verify the multi-step flow works (Welcome -> Login -> Mission).
- [ ] Audio testing: Ensure the success sound effect still plays at the correct time.
