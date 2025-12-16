# Wine Storage App 🍷

A locally hosted, offline-capable application for managing your wine collection, featuring a responsive inventory system and an interactive 3D cellar visualization.

## Prerequisites
Before cloning the repository on a new computer (e.g., your dad's laptop), you must install the following software:

1.  **Node.js**: This is the runtime required to run the application.
    *   **Download**: Go to [nodejs.org](https://nodejs.org/).
    *   **Version**: Download the **LTS (Long Term Support)** version (currently v22.x or v20.x).
    *   **Install**: Run the installer and accept default settings.

2.  **Git**: This is used to clone (download) the code.
    *   **Download**: Go to [git-scm.com](https://git-scm.com/downloads).
    *   **Install**: Run the installer. Default settings are fine, but when asked about the default editor, you can choose Notepad or VS Code if installed.

### Optional but Recommended
*   **Visual Studio Code (VS Code)**: A good code editor to view files or run the terminal easier. [Download here](https://code.visualstudio.com/).

---

## Installation & Setup

1.  **Clone the Repository**
    Open your terminal (Command Prompt or PowerShell on Windows) and run:
    ```bash
    git clone https://github.com/SirPaddington/Wine-Cellar-Inventory-Management-App.git
    cd Wine-Cellar-Inventory-Management-App
    ```

2.  **Install Dependencies**
    In the terminal (inside the `Wine-Cellar-Inventory-Management-App` folder), run:
    ```bash
    npm install
    ```
    This will download all the project libraries listed in `package.json`.

3.  **Run the App**
    Start the local server by running:
    ```bash
    npm run dev
    ```
    You will see output indicating the server is running.

4.  **Open in Browser**
    The terminal will show a link, usually `http://localhost:5173`.
    *   **Click the link** (Hold Ctrl + Click) or copy and paste it into your web browser (Chrome, Edge, Firefox, etc.).
    *   To **STOP** the application, go back to the terminal and press `Ctrl + C`.

---

## Data Persistence & Backup (IMPORTANT)

This application uses **Browser Local Storage** to save your inventory and settings. This means:
*   **Data is stored on your specific computer and browser.** It is NOT saved to the cloud.
*   **Clearing your browser history/cache can delete your data.**
*   **Using a different browser (e.g., switching from Chrome to Edge) will result in an empty inventory.**

### How to Backup & Move Data
To prevent data loss or to move your specific wine collection to another computer, you must use the **Backup** feature.

1.  Navigate to the **Configuration** page in the app.
2.  Locate the **Data Backup** section.
3.  **To Backup:** Click **Export Data (JSON)**. This downloads a file (e.g., `wine-storage-backup-date.json`) to your computer. Save this file safely!
4.  **To Restore/Move:**
    *   Click **Import Data**.
    *   Select your saved `.json` backup file.
    *   Confirm the prompt to overwrite the current data.

> [!WARNING]
> **Excel Export Note**: The "Export to Excel" button is for reporting and viewing purposes only. You **cannot** restore your inventory from an Excel file. Always keep a `.json` backup.

---

## Features
*   **Inventory**: Track red, white, rose, sparkling, and more. Filter by vintage, price, and region.
*   **3D Cellar**: Interactive 3D visualization of your racks. Click bottles to edit, move, or consume them.
*   **Configuration**: Customize your storage units (racks, lockers, fridges) and their dimensions.
*   **Offline Mode**: Fully functional without an internet connection once the server is running.

## Troubleshooting
*   **"command not found"**: Ensure Node.js and Git are installed and you restarted your terminal.
*   **Data missing on new computer**: As noted above, data lives in the browser. Use the **Export/Import (JSON)** feature in Configuration to transfer your collection.
