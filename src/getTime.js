/**
 * Get current Time
 * @returns {string} - Current time
 */

export default function getTime() {
    let date = new Date()
    return date.getHours() + ":" + date.getMinutes(), date.toDateString();
}
