import { Typography } from '@mui/material';
import * as React from 'react';

const content = {
    intro: 'Thank you for visiting my portfolio! I\'d love to hear from you. Whether you have a project in mind, want to collaborate, or simply want to say hello, feel free to reach out using the form below or through the provided contact information.',
    contactInfo: {
        email: 'tyra.krehbiel98@gmail.com', // todo: new email for work inquiries?
        linkedIn: '', // todo: finish links
        github: '',
        instagram: ''
    },
    availability: 'I am currently open to new opportunities and projects. If you\'d like to work together, please don\'t hesitate to get in touch. I typically respond to inquiries within 24-48 hours.',
    privacy: 'Your privacy is important to me. Rest assured that any personal information you provide will be kept confidential and will only be used for the purpose of responding to your inquiry or for potential collaboration.',
    conclusion: 'Thank you once again for your interest in my work. I look forward to connecting with you!'
};

interface ContactRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const Contact: React.FC = () => {

    return (
        <div className='contact'>
            <Typography variant='h1'>Get in Touch</Typography>
            <Typography>{content.intro}</Typography>
            <Typography variant='h2'>Contact Me</Typography>
            {/* TODO Contact Form */}
            <Typography variant='h2'>Contact Info</Typography>
            <Typography>{content.contactInfo.email}</Typography>
            <Typography>{content.contactInfo.linkedIn}</Typography>
            <Typography>{content.contactInfo.github}</Typography>
            <Typography>{content.contactInfo.instagram}</Typography>
            <Typography variant='h2'>Availability</Typography>
            <Typography>{content.availability}</Typography>
            <Typography variant='h2'>Privacy Notice</Typography>
            <Typography>{content.privacy}</Typography>
            <Typography>{content.conclusion}</Typography>
        </div>
    );
};

export default Contact;