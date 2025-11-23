import { vectorHelpers } from '@/lib/vector';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save to database
    const contactMessage = await vectorHelpers.addContactMessage({
      name,
      email,
      message,
    });

    // Send email notification
    try {
      // Create transporter using Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'renantemarzan11@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.GMAIL_USER || 'renantemarzan11@gmail.com',
        to: 'renantemarzan11@gmail.com',
        subject: `New Contact Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #4a5568;">New Contact Message</h2>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <p style="background-color: white; padding: 15px; border-radius: 4px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 20px;">
              This message was sent from your portfolio website contact form.
            </p>
          </div>
        `,
        text: `
New Contact Message

Name: ${name}
Email: ${email}

Message:
${message}

---
This message was sent from your portfolio website contact form.
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to renantemarzan11@gmail.com');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the entire request if email fails, just log it
    }

    return NextResponse.json(contactMessage, { status: 201 });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await vectorHelpers.getContactMessages();
    
    // Already sorted by createdAt descending in the helper
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
