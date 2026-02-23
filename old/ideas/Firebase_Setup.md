# How to setup Firebase Cloud Sync (Free & Works perfectly offline!)

Firebase is Google's backend platform. The reason Firebase is perfect for us is because its official Javascript SDK **does not get blocked by CORS errors** when running directly from a local `file:///` on your computer!

Here is the one-time, 3-minute setup to get your free database running:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add Project"** (or create one).
2. Give it a name like `Electricity-Sync` and click Continue.
3. Turn **OFF** Google Analytics (you don't need it) and click **Create Project**. Wait for it to finish and click Continue.

### Step 2: Set up the Realtime Database
1. On the left menu, expand **Build** and click **Realtime Database**.
2. Click **Create Database**.
3. Choose any location (US or Europe doesn't matter) and hit **Next**.
4. **CRITICAL:** Choose **"Start in test mode"** (this allows your app to read/write without complex login systems for 30 days. We will fix this in a second). Click **Enable**.
5. Once inside the database, click the **"Rules"** tab at the top.
6. Change the rules to be completely open so you never get locked out. Make it look exactly like this:
```json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```
7. Click **Publish**.

### Step 3: Get your Configuration
1. Now, look at the top left menu and click the **Project Overview** (house icon) or the gear icon next to it and go to **Project settings**.
2. Scroll down to the **"Your apps"** section and click the **Web icon** (looks like `</>`).
3. Nickname the app (e.g. `electricity-app`) and click **Register app**.
4. You will see a block of code with a `firebaseConfig` object that looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "electricity-sync-123.firebaseapp.com",
  databaseURL: "https://electricity-sync-123-default-rtdb.firebaseio.com",
  projectId: "electricity-sync-123",
  storageBucket: "electricity-sync-123.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456"
};
```

### Step 4: Add it to your App!
1. Open `electricity_calc.html` in your browser.
2. Go to Settings -> **Cloud Sync (Firebase)**.
3. Copy **ONLY the `databaseURL`** (for example: `https://electricity-sync-123-default-rtdb.firebaseio.com`) and paste it into the **Database URL** box in your app!
4. Copy the long **`apiKey`** string (for example: `AIzaSyDOCAbC123dEf456GhI789jKl01-MnO`) and paste it into the **API Key** box in your app!

You are done! Now you can hit "Save to Cloud" or "Load from Cloud" from any device and it will sync in milliseconds!
