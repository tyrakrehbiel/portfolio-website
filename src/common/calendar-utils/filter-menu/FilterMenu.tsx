import * as React from 'react';

import { Tag } from '../../../@types';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../../@types';
import { useAppSelector } from '../../../store/hooks';

import { motion , AnimatePresence} from 'framer-motion';

import { getUserTags} from '../../../axios/tags';
import './_FilterMenu.scss';


const FilterMenu: React.FC = (showFilterMenu) => {

    const token = useAppSelector(store => store.login.token);
    const decodedToken: DecodedToken = jwt_decode(token);
    const userId = decodedToken.id;

    const [tags, setTags] = React.useState<Tag[]>([]);

    React.useEffect(() => {
        getUserTags(Number(userId)).then(res => {
            const allTags = res.data;
            setTags(allTags.filter((tag) => !tag.archived)) //filter out all archived tags
        })
    }, [userId]); 

    const variants = {
        open: {
            y: 0,
            opacity: 1,
            transition: {
                y: { stiffness: 1000, velocity: -100 }
            }
        },
        closed: {
            y: 50,
            opacity: 0,
            transition: {
                y: { stiffness: 1000 }
            }
        }
    };

    return (
        <AnimatePresence >
            <motion.div className='filter-menu paper'>
                <motion.li
                    variants={variants}
                >
                    <div>Events</div>
                    <div>Journal Entries</div>
                </motion.li>
            </motion.div>

        </AnimatePresence>
    )
}

export default FilterMenu;