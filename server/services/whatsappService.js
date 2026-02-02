import axios from 'axios';
import Student from '../models/Student.js';

/**
 * WhatsApp Service for sending notifications
 * Supports: Twilio WhatsApp API (Sandbox & Production), Meta WhatsApp Business API
 */
class WhatsAppService {
    constructor() {
        this.config = {
            whatsapp_provider: process.env.WHATSAPP_PROVIDER || 'twilio',
            whatsapp_account_sid: process.env.WHATSAPP_ACCOUNT_SID,
            whatsapp_api_key: process.env.WHATSAPP_API_KEY, // Auth Token
            whatsapp_phone_number: process.env.WHATSAPP_PHONE_NUMBER,
            whatsapp_business_id: process.env.WHATSAPP_BUSINESS_ID
        };
        this.provider = this.config.whatsapp_provider;
    }

    // Send WhatsApp message using Twilio
    async sendMessageTwilio(to, message) {
        try {
            const accountSid = this.config.whatsapp_account_sid;
            const authToken = this.config.whatsapp_api_key;
            const fromNumber = this.config.whatsapp_phone_number;

            if (!accountSid || !authToken || !fromNumber) {
                // Return silent failure if not configured, to avoid crashing app logic
                // console.warn('Twilio WhatsApp not configured');
                return { success: false, error: 'Twilio WhatsApp not configured' };
            }

            // Format phone number for Twilio
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

            const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

            const response = await axios.post(
                url,
                new URLSearchParams({
                    From: formattedFrom,
                    To: formattedTo,
                    Body: message
                }),
                {
                    auth: {
                        username: accountSid,
                        password: authToken
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.sid,
                status: response.data.status,
                data: response.data
            };
        } catch (error) {
            console.error('Twilio WhatsApp error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Send WhatsApp message using Meta
    async sendMessageMeta(to, message) {
        try {
            const formattedPhone = to.replace(/[^\d]/g, '');
            const url = `https://graph.facebook.com/v18.0/${this.config.whatsapp_business_id}/messages`;

            const response = await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'text',
                    text: {
                        body: message
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.whatsapp_api_key}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                messageId: response.data.messages[0].id,
                data: response.data
            };
        } catch (error) {
            console.error('Meta WhatsApp error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Send WhatsApp message (auto-detect provider)
    async sendMessage(to, message) {
        if (this.provider === 'twilio') {
            return await this.sendMessageTwilio(to, message);
        } else if (this.provider === 'meta') {
            return await this.sendMessageMeta(to, message);
        } else {
            // Default to twilio if unknown
            return await this.sendMessageTwilio(to, message);
        }
    }

    // Send attendance notification
    async sendAttendanceNotification(studentId, date, status) {
        try {
            const student = await Student.findById(studentId);

            if (!student) {
                throw new Error('Student not found');
            }

            const studentName = `${student.firstName} ${student.lastName}`;
            const className = `${student.year}${student.section}`;

            const message = `
🎓 *SIET CSE - Attendance Alert*

Dear ${student.parentName || 'Parent'},

Student: ${studentName}
Class: ${className}
Date: ${new Date(date).toLocaleDateString('en-IN')}
Status: ${status.toUpperCase()}

${status === 'absent' ? '⚠️ Your ward was marked ABSENT today.' : status === 'late' ? '⏰ Your ward was marked LATE today.' : '✅ Your ward was marked PRESENT today.'}

For any queries, please contact the class teacher.

- SIET, Dept of CSE
            `.trim();

            if (student.parentPhone) {
                const result = await this.sendMessage(student.parentPhone, message);
                return result;
            } else {
                return {
                    success: false,
                    error: 'Parent phone number not available'
                };
            }
        } catch (error) {
            console.error('Send attendance notification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send marks notification
    async sendMarksNotification(studentId, subject, examType, marksObtained, maxMarks) {
        try {
            const student = await Student.findById(studentId);

            if (!student) {
                throw new Error('Student not found');
            }

            const studentName = `${student.firstName} ${student.lastName}`;
            const className = `${student.year}${student.section}`;
            const percentage = ((marksObtained / maxMarks) * 100).toFixed(2);

            const message = `
📊 *SIET CSE - Marks Update*

Dear ${student.parentName || 'Parent'},

Student: ${studentName}
Class: ${className}
Subject: ${subject}
Exam Type: ${examType.toUpperCase()}

Marks Obtained: ${marksObtained}/${maxMarks}
Percentage: ${percentage}%

${percentage >= 75 ? '🎉 Excellent performance!' : percentage >= 60 ? '👍 Good work!' : percentage >= 40 ? '📚 Needs improvement.' : '⚠️ Requires immediate attention.'}

Keep up the good work!

- SIET, Dept of CSE
            `.trim();

            if (student.parentPhone) {
                const result = await this.sendMessage(student.parentPhone, message);
                return result;
            } else {
                return {
                    success: false,
                    error: 'Parent phone number not available'
                };
            }
        } catch (error) {
            console.error('Send marks notification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send bulk notifications
    async sendBulkAttendanceNotifications(attendanceRecords) {
        const results = [];
        for (const record of attendanceRecords) {
            const result = await this.sendAttendanceNotification(
                record.student_id,
                record.date,
                record.status
            );
            results.push({ student_id: record.student_id, ...result });
            await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
        }
        return results;
    }

    async sendBulkMarksNotifications(marksRecords) {
        const results = [];
        for (const record of marksRecords) {
            const result = await this.sendMarksNotification(
                record.student_id,
                record.subject,
                record.exam_type,
                record.marks_obtained,
                record.max_marks
            );
            results.push({ student_id: record.student_id, ...result });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return results;
    }
}

export default new WhatsAppService();
