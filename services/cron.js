const { CronJob } = require('cron');
const { Op } = require('sequelize');
const Chat = require('../models/chatdata');
const ArchivedChat = require('../models/archeived-chat');

exports.job = new CronJob(
    '30 3 * * *', // Run at 3:30 AM every day
    function () {
        archiveChat();
    },
    null,
    true,
    'America/Los_Angeles'
);

async function archiveChat() {
    try {
        const currentDate = new Date();
        const tenDaysAgo = new Date(currentDate);
        tenDaysAgo.setDate(currentDate.getDate() - 10);

        // Find records to archive
        const recordsToArchive = await Chat.findAll({
            where: {
                createdAt: {
                    [Op.lt]: tenDaysAgo,
                },
            },
        });

        // Archive records
        await Promise.all(
            recordsToArchive.map(async (record) => {
                await ArchivedChat.create({
                    id: record.id,
                    message: record.message,
                    isImage: record.isImage,
                    UserId: record.UserId,
                    GroupId: record.GroupId,
                });
                await record.destroy();
            })
        );
        console.log('Old records archived successfully.');
    } catch (error) {
        console.error('Error archiving old records:', error);
    }
}
