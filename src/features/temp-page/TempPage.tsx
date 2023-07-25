import * as React from 'react';
import { Link, Typography } from '@mui/material';
import './_TempPage.scss';

const TempPage: React.FC = () => {
    return (
        <div className="temp-page-container text-div">
            <Typography variant="h1" className="title">
                Website currently under maintenance
            </Typography>
            <hr />
            <Typography variant="h2" className="text">
                In the meantime, check out Tyra&apos;s instagram
            </Typography>
            {/* <Typography variant="h2" className="text">
                @tyrakrehbiel.art
            </Typography> */}
            <Link href="https://www.instagram.com/tyrakrehbiel.art/" className="text link">
                @tyrakrehbiel.art
            </Link>
            <Typography variant="h5" className="thanks">
                Thank you! Update!
            </Typography>
        </div>
    );
};

export default TempPage;