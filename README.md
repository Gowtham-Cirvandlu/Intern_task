
# 🧠 TaskGlitch – SDE Bug Fixes Challenge

This repository contains my solution for the **TaskGlitch Task Management Web App** bug-fix challenge.

I debugged and fixed all **five major bugs** to make the app robust, stable, and ready for production.  
See the hosted app link for final evaluation!

---

## 🚀 Project Overview

TaskGlitch helps sales teams track and manage productivity using ROI (Return on Investment) as a key metric.

### **Each task supports:**
- Revenue
- Time Taken (hours)
- ROI Calculation (validated)
- Notes (secure rendering)
- Priority (High/Medium/Low)
- Status (Todo/In Progress/Done)

---

## 🛠 Tech Stack

- **React (TypeScript + Vite)**
- **Material UI**
- **Custom Context/Hook API**
- **CSV Import/Export utilities**
- **MUI X Charts (dashboard visualization)**
- **Deployed via:** Vercel

---

## 🐞 Fixed Bug Summaries

### 1️⃣ Double Fetch Issue
- **Fixed:** Used a `useRef` to guarantee a single data load (even in React StrictMode).

### 2️⃣ Undo Snackbar / Delete State
- **Fixed:** `lastDeleted` task state resets correctly when snackbar closes, preventing "phantom" undo actions.

### 3️⃣ Unstable Sorting (ROI ties)
- **Fixed:** Sorting now uses a stable tie-breaker (alphabetical task title → created timestamp), eliminating flicker/shuffle.

### 4️⃣ Double Dialog Opening
- **Fixed:** Event bubbling removed using `e.stopPropagation()`; only the intended dialog opens per click.

### 5️⃣ ROI Error Handling
- **Fixed:** Safe ROI calculation, handling timeTaken of 0 and invalid input, formatted to 2 decimal places. No Infinity/NaN ever shown.

---

## ⚙️ Local Development

```bash
1. Clone the repository
    git clone https://github.com/hsai-rohit/task-glitch.git
    cd task-glitch

2. Install dependencies
    npm install

3. Run in development mode
    npm run dev

4. Build for production
    npm run build

5. Preview the build
    npm run preview
```

---

## 📦 Production Hosting

- Public live app: [https://hsairohit-taskglitch.vercel.app](https://task-glitch-ruddy.vercel.app/)
- Deployed using Vercel with continuous integration from `main`.

---

## 📝 Author

**H Sai Rohit**  
- [GitHub Profile](https://github.com/hsai-rohit)
- Submission for SDE Bug Fixes Challenge

---

## ✅ Evaluation/Submission

- [x] All required bugs fixed in code and UX
- [x] App is live and public  
- [x] Commit history shows clear fixes for each bug

---

*Thank you for reviewing my submission! Please open an issue or contact me for questions.*


