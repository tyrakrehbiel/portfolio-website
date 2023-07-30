import * as React from 'react';
import { Button, Grid, Typography } from '@mui/material';

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
        <Grid container className='home'>
            <Grid item container xs={12} className='content-section-1'>
                <Grid item xs={12} md={6}>
                    <Typography variant='h1'>Tyra Krehbiel</Typography>
                    <Typography variant='h2'>Full Stack Software Developer,</Typography>
                    <Typography variant='h2'>UI/UX Designer,</Typography>
                    <Typography variant='h2'>& Artist</Typography>
                    <Button variant='contained'>Hire Me</Button>
                </Grid>
                <Grid item xs={12} md={6}>
                    <div style={{ height: '500px', backgroundColor: 'gray' }} />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Typography variant='h1' className='title'>{content.greeting}</Typography>
                <Typography className='text'>{content.intro}</Typography>
                <Typography className='text'>{content.primary}</Typography>
                <Typography className='text'>{content.secondary}</Typography>
                <Typography className='text'>{content.thanks}</Typography>
            </Grid>
        </Grid>
    );
};

export default Home;