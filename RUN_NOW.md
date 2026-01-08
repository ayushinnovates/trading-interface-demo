# 🚀 Quick Start - Run the Application Now

## ⚠️ Prerequisite: Install Node.js First

Node.js is required to run this application. Here's the fastest way to install it:

### macOS Installation Options:

**Option 1: Download Installer (Easiest)**
1. Visit: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Restart your terminal

**Option 2: Using Homebrew (if you have it)**
```bash
brew install node
```

**Option 3: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
```

### Verify Installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## 🎯 Once Node.js is Installed:

### Method 1: Automated Start (Recommended)
```bash
cd /Users/ayushmalik/Desktop/bajaj-broking
./start.sh
```

### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /Users/ayushmalik/Desktop/bajaj-broking/backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/ayushmalik/Desktop/bajaj-broking/frontend
npm install
npm run dev
```

---

## 🌐 Access the Application:

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

---

## ✅ What's Already Prepared:

- ✅ All project files are ready
- ✅ Environment configuration (.env) is set up
- ✅ Directory structure is created
- ✅ Dependencies will install automatically on first run

Just install Node.js and run `./start.sh`!

