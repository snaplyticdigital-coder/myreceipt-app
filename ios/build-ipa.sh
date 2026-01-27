#!/bin/bash
# Duitrack iOS Ad-Hoc IPA Build Script
# Run from project root: ./ios/build-ipa.sh

set -e

echo "================================================"
echo "  Duitrack iOS Ad-Hoc IPA Builder"
echo "================================================"

# Configuration
PROJECT_DIR="$(cd "$(dirname "$0")/App" && pwd)"
WORKSPACE="$PROJECT_DIR/App.xcworkspace"
SCHEME="App"
ARCHIVE_PATH="$PROJECT_DIR/build/Duitrack.xcarchive"
EXPORT_PATH="$PROJECT_DIR/build/IPA"
EXPORT_OPTIONS="$(dirname "$0")/ExportOptions.plist"

# Check if Xcode is configured
if ! xcodebuild -version &> /dev/null; then
    echo "Error: Xcode command line tools not configured."
    echo "Run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

echo ""
echo "Step 1: Cleaning previous builds..."
rm -rf "$PROJECT_DIR/build"
mkdir -p "$EXPORT_PATH"

echo ""
echo "Step 2: Building and archiving..."
xcodebuild -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    clean archive

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo "Error: Archive failed. Check signing configuration in Xcode."
    exit 1
fi

echo ""
echo "Step 3: Exporting IPA..."
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS"

echo ""
echo "================================================"
echo "  BUILD COMPLETE!"
echo "================================================"
echo ""
echo "IPA Location: $EXPORT_PATH/App.ipa"
echo ""
echo "Upload to Diawi: https://www.diawi.com/"
echo ""
