import { Typography } from '@mui/material';
import * as React from 'react';

const content = {
    intro: 'I\'m a passionate and dedicated software developer and UI/UX designer who loves crafting innovative solutions. Here is a bit about myself:',
    
    childhood: 'From a young age, I enjoyed solving puzzles and playing with technology, which led me to pursue a career in software development. I thrive on coding challenges and enjoy creating elegant solutions to complex problems.',
    education1: 'I have a degree in Computer Science from the University of Virginia, where I gained a strong foundation in programming languages, algorithms, and data structures. Throughout my studies, I actively sought internships and personal projects to gain hands-on experience.',
    skills: 'My expertise spans various technologies, including web development, UI/UX design, and software engineering. Writing clean and maintainable code is something I take pride in, and I\'m always eager to learn new tools and frameworks.',
    
    creative: 'In addition to my technical skills, I value creativity and user-centric design. I understand that technology is about more than just code; it\'s also about enhancing user experiences and making a positive impact on people\'s lives. I strive to develop applications that are not only functional but also visually appealing and intuitive.',
    education2: 'I also hold a degree in Studio Art from the University of Virginia, which has enhanced my design skills and allowed me to create more visually appealing user interfaces.',
    merge: 'What truly drives me is the opportunity to merge these different worlds. I enjoy finding imaginative solutions to problems, whether through efficient code or captivating visuals.',
    
    conclusion: 'This portfolio showcases projects that represent my dedication, problem-solving abilities, creative eye, and passion for impactful software. I invite you to explore my work and see the possibilities that arise when passion meets technology.'
        + '\n'
        + 'Thank you for visiting my portfolio. I\'m excited about the future of software development and can\'t wait to collaborate on new and exciting projects. Let\'s build something remarkable together!'
};

const About: React.FC = () => {

    return (
        <div className='about'>
            <Typography variant='h1'>About Me</Typography>
            <Typography >{content.intro}</Typography>
            <div className='section-1-img' />
            <Typography >{content.childhood}</Typography>
            <Typography >{content.education1}</Typography>
            <Typography >{content.skills}</Typography>
            <div className='section-2-img' />
            <Typography >{content.creative}</Typography>
            <Typography >{content.education2}</Typography>
            <Typography >{content.merge}</Typography>
            <Typography >{content.conclusion}</Typography>
            <div className='conclusion-img' />
        </div>
    );
};

export default About;