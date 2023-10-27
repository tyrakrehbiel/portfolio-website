import * as React from 'react';
import { LinkedIn } from '@mui/icons-material';
import { openLink } from '../../../common/utils';

interface LinkedInBtnProps {
    closeDrawer: () => void;
}

const LinkedInBtn: React.FC<LinkedInBtnProps> = (props) => {

    const toLinkedIn = () => {
        openLink('https://linkedin.com');
        props.closeDrawer();
    };

    return (
        <div className='icon-button' onClick={toLinkedIn}>
            <LinkedIn />
        </div>
    );
};

export default LinkedInBtn;