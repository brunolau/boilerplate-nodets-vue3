const fs = require("fs");
const path = require("path");
console.log("Cleaning previous builds");

const appWorker = async () => {
    const frontendBuildPath = path.join(__dirname, "..", "dist", "build-prod");
    if (fs.existsSync(frontendBuildPath)) {
        fs.rmSync(frontendBuildPath, { recursive: true, force: true });
    }

    console.log("Cleanup complete");
    process.exit();
};

appWorker();
