const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== "darwin") {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: "com.deepfile.deepfile", // Specify your app bundle identifier
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID, // Your Apple ID
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD, // Your Apple ID password or app-specific password
    });
}
