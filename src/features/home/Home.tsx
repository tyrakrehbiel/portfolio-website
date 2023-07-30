import * as React from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const content1 = {
    name: 'Tyra Krehbiel',
    title: ['Full Stack Software Developer,','UI/UX Designer,','& Artist'],
    cta: 'Hire Me'
};

const content2 = {
    greeting: 'Hello and welcome!',
    intro: 'I\'m Tyra, a Fullstack Software Developer with a flair for UI/UX design and a passion for artistry.',
    primary: 'In this digital portfolio, you\'ll find the perfect blend of technology and creativity. ' + 
    'As a software developer, I strive to craft seamless solutions that not only function flawlessly but also engage users through captivating interfaces. ' +
    'From intuitive app designs to user-friendly websites, I believe in the power of design to elevate the digital experience.',
    secondary: 'Here, you\'ll explore a curated fusion of my technical skill and artistic expressions.',
    thanks: 'Thank you for visiting!'
};

const Home: React.FC = () => {

    const navigate = useNavigate();

    return (
        <Grid container className='home'>
            <Grid item container xs={12} className='content-section-1' spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant='h1' className='title'>{content1.name}</Typography>
                    {content1.title.map((t,i) =>
                        <Typography variant='h2' key={`title-${i}`}>{t}</Typography>)
                    }
                    <Button variant='contained' color='secondary' size='large' className='cta-button' onClick={() => navigate('/contact')}>{content1.cta}</Button>
                </Grid>
                <Grid item xs={12} md={6}>
                    <div style={{ height: '500px', backgroundColor: 'gray' }} />
                </Grid>
            </Grid>
            <Grid item xs={12} className='content-section-2'>
                <Grid item xs={12} className='sub-section'>
                    <Typography variant='h1' className='title'>{content2.greeting}</Typography>
                    <Typography className='text'>{content2.intro}</Typography>
                    <Typography className='text'>{content2.primary}</Typography>
                    <Typography className='text'>{content2.secondary}</Typography>
                    <Typography className='text'>{content2.thanks}</Typography>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Home;