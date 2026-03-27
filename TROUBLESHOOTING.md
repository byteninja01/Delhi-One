# Troubleshooting Expo Go Connectivity

If scanning the QR code opens a website instead of the app in Expo Go, it usually means your phone cannot establish a direct connection to your computer's local IP address or the QR code is being misinterpreted as a standard web link.

### 1. The "Tunnel" Solution (Recommended)
This is the most reliable method. It creates a public URL for your project, bypassing firewall and Wi-Fi issues.

Run this command in your terminal:
```bash
npx expo start --tunnel
```
> [!NOTE]
> You may be prompted to install `@expo/ngrok`. Type `y` to proceed. This will provide a new QR code that works even if your phone and computer are on different networks.

### 2. General Connectivity Checks
- **Same Wi-Fi**: Ensure both your computer and your phone are connected to the **exact same** Wi-Fi network.
- **Firewall Settings**: Windows Firewall sometimes blocks the Expo port (8081). Try disabling it temporarily or adding an exception for Node.js.
- **Network Type**: Ensure your Wi-Fi is set to "Private" rather than "Public" in Windows settings, as "Public" blocks local incoming connections.

### 3. Using the Correct URL
If you see the QR code in the terminal:
- Open the **Expo Go** app first.
- Use the **"Scan QR Code"** button *inside* the app, rather than your phone's default camera app.

### 4. Direct Link (Alternative)
If the QR code still fails, you can manually type the URL into the Expo Go app:
1. Look for the `exp://192.168.x.x:8081` link in your terminal.
2. In Expo Go, tap **"Enter URL manually"** and type it in.
