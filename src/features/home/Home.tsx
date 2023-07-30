import * as React from 'react';
import { Typography } from '@mui/material';

const content = {
    greeting: 'Hello and welcome!',
    intro: 'I\'m Tyra, a Fullstack Software Developer with a flair for UI/UX design and a passion for artistry.',
    primary: 'In this digital portfolio, you\'ll find the perfect blend of technology and creativity. ' + 
    'As a software developer, I strive to craft seamless solutions that not only function flawlessly but also engage users through captivating interfaces. ' +
    'From intuitive app designs to user-friendly websites, I believe in the power of design to elevate the digital experience.',
    secondary: 'Here, you\'ll explore a curated fusion of my technical skill and artistic expressions.',
    thanks: 'Thank you for visiting!'
};

const Home: React.FC = () => {
    return (
        <div className='home'>
            <div className='portrait' />
            <Typography variant='h1' className='title'>{content.greeting}</Typography>
            <Typography className='text'>{content.intro}</Typography>
            <Typography className='text'>{content.primary}</Typography>
            <Typography className='text'>{content.secondary}</Typography>
            <Typography className='text'>{content.thanks}</Typography>
        </div>
    );
};

export default Home;