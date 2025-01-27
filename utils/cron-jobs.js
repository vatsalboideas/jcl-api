const cron = require('node-cron');
const path = require('path');
const { promises: fs } = require('fs'); // Import the promise-based fs methods
const models = require('../models'); // Adjust path as needed

// Utility function to log cron activities
const logCronActivity = (message, error = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  if (error) {
    console.error(logMessage, error);
  } else {
    console.log(logMessage);
  }
};

// Function to delete old career forms
const deleteOldCareerForms = async () => {
  try {
    // Find old career forms (e.g., older than 45 days)
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const oldCareerForms = await models.careerForms.findAll({
      where: {
        createdAt: {
          [models.Sequelize.Op.lt]: fortyFiveDaysAgo,
        },
      },
    });

    for (const career of oldCareerForms) {
      await career.destroy();
    }

    logCronActivity(`Deleted ${oldCareerForms.length} old career forms`);
    return oldCareerForms.length;
  } catch (error) {
    logCronActivity('Error deleting career forms', error);
    throw error;
  }
};

// Function to delete old contact forms
const deleteOldContactForms = async () => {
  try {
    // Find old career forms (e.g., older than 45 days)
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const oldContactForms = await models.contactUsForms.findAll({
      where: {
        createdAt: {
          [models.Sequelize.Op.lt]: fortyFiveDaysAgo,
        },
      },
    });

    for (const contact of oldContactForms) {
      await contact.destroy();
    }

    logCronActivity(`Deleted ${oldContactForms.length} old contact forms`);
    return oldContactForms.length;
  } catch (error) {
    logCronActivity('Error deleting contact forms', error);
    throw error;
  }
};

// Function to delete unused media files (PDFs only)
const deleteUnusedMedia = async () => {
  try {
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    // Find old media that are PDFs
    const oldMedia = await models.media.findAll({
      where: {
        createdAt: {
          [models.Sequelize.Op.lt]: fortyFiveDaysAgo,
        },
        // Add condition to check for PDF files
        url: {
          [models.Sequelize.Op.like]: '%.pdf',
        },
      },
    });

    let deletedCount = 0;

    for (const media of oldMedia) {
      try {
        const filePath = path.resolve(media.url);
        await fs.access(filePath);
        await fs.unlink(filePath);
        await media.destroy();
        deletedCount++;
      } catch (fileError) {
        logCronActivity(`Failed to delete PDF file: ${media.url}`, fileError);
      }
    }

    logCronActivity(`Deleted ${deletedCount} unused PDF files`);
    return deletedCount;
  } catch (error) {
    logCronActivity('Error deleting PDF files', error);
    throw error;
  }
};

// Main cron job function
const startCleanupCron = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logCronActivity('Starting daily cleanup cron job');

    try {
      const results = await Promise.all([
        deleteOldCareerForms(),
        deleteOldContactForms(),
        deleteUnusedMedia(),
      ]);

      logCronActivity(
        `Cleanup completed successfully. Deleted: ${results[0]} career forms, ${results[1]} contact forms, ${results[2]} media files`
      );
    } catch (error) {
      logCronActivity('Daily cleanup cron job failed', error);
    }
  });

  logCronActivity('Cleanup cron job scheduled');
};

module.exports = startCleanupCron;
