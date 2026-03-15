import User from '../models/user.js';
import cron from 'node-cron';

class HasCheckedWorker {
    constructor() {
        this.task = null;
    }

    async updateStatus() {
        try {
            const result = await User.updateMany(
                { is_checked_today: true },
                { $set: { is_checked_today: false } }
            );
            console.log(`[HasCheckedWorker] Updated ${result.modifiedCount} users.`);
        } catch (error) {
            console.error('[HasCheckedWorker] Error updating users:', error);
        }
    }

    async start() {
        console.log('[HasCheckedWorker] Starting...');

        this.task = cron.schedule('0 0 * * *', async () => {
            await this.updateStatus();
        });

        console.log('[HasCheckedWorker] Scheduled for 00:00 every day.');
    }

    async stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
            console.log('[HasCheckedWorker] Stopped.');
        }
    }
}

export default HasCheckedWorker;