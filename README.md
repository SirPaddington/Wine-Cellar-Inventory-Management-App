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
    git clone https://github.com/YourUsername/Wine-Storage.git
    cd Wine-Storage
    ```
    *(Note: Replace `YourUsername` with the actual GitHub username where this repo is hosted).*

2.  **Install Dependencies**
    In the terminal (inside the `Wine-Storage` folder), run:
    ```bash
    npm install
    ```
    This will download all the project libraries listed in `package.json`.

3.  **Run the App**
    Start the local server by running:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    The terminal will show a link, usually `http://localhost:5173`.
    *   Ctrl + Click the link or type it into your browser address bar.

---

## Features
*   **Inventory**: Track red, white, rose, sparkling, and more. Filter by vintage, price, and region.
*   **3D Cellar**: Interactive 3D visualization of your racks. Click bottles to edit, move, or consume them.
*   **Configuration**: Customize your storage units (racks, lockers, fridges) and their dimensions.
*   **Data Backup**:
    *   Go to **Configuration** page.
    *   **Export**: Support moving data between computers.
    *   **Import**: Restore data from a previous backup.
*   **Offline Mode**: Fully functional without an internet connection once the server is running.

## Troubleshooting
*   **"command not found"**: Ensure Node.js and Git are installed and you restarted your terminal.
*   **Data missing on new computer**: Data is stored in the browser. Use the **Export/Import** feature in Configuration to migrate your collection.
