# Duitrack iOS Ad-Hoc Distribution Guide

This guide walks you through distributing Duitrack to testers via Diawi.

## Prerequisites

- Apple Developer Account ($99/year): https://developer.apple.com
- Xcode installed on M4 Mac
- Partner's iPhone UDID

---

## Step 1: Get Device UDIDs

### Your iPhone:
1. Connect iPhone to Mac via USB-C
2. Open **Finder** > Select your iPhone
3. Click the device info below the name until you see **UDID**
4. Right-click > **Copy UDID**

### Partner's iPhone:
Ask them to:
1. Visit https://udid.tech on Safari (iPhone)
2. Install the profile when prompted
3. Copy and send you the UDID

---

## Step 2: Register Devices in Apple Developer Portal

1. Go to: https://developer.apple.com/account/resources/devices/list
2. Click **+** to add a new device
3. Enter:
   - **Name**: "Faris iPhone" / "Partner iPhone"
   - **UDID**: The copied UDID
4. Click **Continue** > **Register**

---

## Step 3: Create Ad-Hoc Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click **+** to create a new profile
3. Select **Ad Hoc** under Distribution
4. Select **App ID**: `com.snaplytic.duitrack.dev` (create if needed)
5. Select your **Distribution Certificate**
6. Select **ALL registered devices** (including partner's)
7. Name it: `Duitrack AdHoc Profile`
8. Download the `.mobileprovision` file

---

## Step 4: Configure Xcode

1. Open Terminal and run:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

2. Open the project:
   ```bash
   npx cap open ios
   ```

3. In Xcode:
   - Select **App** target in the sidebar
   - Go to **Signing & Capabilities** tab
   - Uncheck **Automatically manage signing**
   - For **Release** configuration:
     - **Team**: Select your team
     - **Provisioning Profile**: Import and select `Duitrack AdHoc Profile`

4. Update `ios/ExportOptions.plist`:
   - Replace `YOUR_TEAM_ID` with your Apple Team ID
   - Replace `Duitrack AdHoc Profile` with exact profile name

---

## Step 5: Build the IPA

### Option A: Using Build Script
```bash
cd /Users/faris/.gemini/antigravity/scratch/myreceipt-app
./ios/build-ipa.sh
```

### Option B: Manual in Xcode
1. Select **Product** > **Archive**
2. In Organizer, select the archive
3. Click **Distribute App**
4. Select **Ad Hoc** > **Next**
5. Select your provisioning profile
6. Export to `ios/build/IPA/`

---

## Step 6: Upload to Diawi

1. Go to: https://www.diawi.com/
2. Drag and drop the `.ipa` file
3. Wait for upload to complete
4. Copy the **installation link**
5. Send link to your partner

---

## Step 7: Install on Partner's Device

Partner should:
1. Open the Diawi link in **Safari** (not Chrome)
2. Tap **Install**
3. Go to **Settings** > **General** > **VPN & Device Management**
4. Trust your developer certificate
5. Open Duitrack!

---

## Troubleshooting

### "Unable to install" error
- Device UDID not registered in the provisioning profile
- Profile not downloaded to Xcode (Preferences > Accounts > Download)

### "App could not be verified"
- Internet connection required for first launch
- Try again in a few minutes

### Build fails
- Check that Team ID matches in ExportOptions.plist
- Ensure provisioning profile includes all target devices

---

## File Locations

| File | Path |
|------|------|
| Xcode Project | `ios/App/App.xcworkspace` |
| Export Options | `ios/ExportOptions.plist` |
| Build Script | `ios/build-ipa.sh` |
| Output IPA | `ios/App/build/IPA/App.ipa` |

---

## Quick Reference

| Item | Value |
|------|-------|
| Bundle ID | `com.snaplytic.duitrack.dev` |
| App Name | Duitrack |
| Min iOS | 15.0 |
| Diawi | https://www.diawi.com |
