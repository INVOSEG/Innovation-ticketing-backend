const fs = require('fs');
const path = require('path');

/**
 * Appends data to a log file with a timestamp.
 * @param {string} fileName - The name of the file to append to.
 * @param {Object} data - The data to append to the file.
 */
function appendToFile(fileName, data) {
    const filePath = path.join(__dirname, '..', 'logs', fileName);
    
    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Prepare data with timestamp
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${JSON.stringify(data)}\n`;

    // Append data to file
    fs.appendFile(filePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to append to file:', err);
        }
    });
}

module.exports = {
    appendToFile
};
