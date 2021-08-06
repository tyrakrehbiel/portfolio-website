import React from 'react';
import { useHistory } from 'react-router';
import {
    createStyles,
    makeStyles,
} from '@material-ui/core/styles';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Menu,
    MenuItem,
    Button
}
    from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Entry, ImageStore, Tag } from '../../@types';
import { deleteEntry, belongsToMe } from '../../axios/entries';
import { getUserTags } from '../../axios/tags';
import { deleteImageStoreById, getImageById } from '../../axios/imageStores';
import ThumbnailCarousel from '../thumbnail-carousel/ThumbnailCarousel';

const useStyles = makeStyles(() =>
    createStyles({
        card: {
            minWidth: 100,
            minHeight: 100,
            maxHeight: 270,
            flexGrow: 1,
            boxShadow: '2px 2px 7px 0px lightgrey',
            borderRadius: '2px',
        }
    })
);

interface Props {
    journal: Entry,
    userId: number
}

const JournalCard: React.FC<Props> = ({ journal, userId }: Props) => {
    const classes = useStyles();
    const history = useHistory();

    //for options menu
    const [clicked, setClicked] = React.useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setClicked(event.currentTarget);
    };
    const handleClose = () => {
        setClicked(null);
    };

    const year = journal.startDateTime.substring(0, 4);
    const month = journal.startDateTime.substring(5, 7);
    let monthString = '';
    let day = journal.startDateTime.substring(8, 10);

    if (day.charAt(0) == '0') {
        day = day.substring(1);
    }


    switch (month) {
    case '01':
        monthString = 'January';
        break;
    case '02':
        monthString = 'February';
        break;
    case '03':
        monthString = 'March';
        break;
    case '04':
        monthString = 'April';
        break;
    case '05':
        monthString = 'May';
        break;
    case '06':
        monthString = 'June';
        break;
    case '07':
        monthString = 'July';
        break;
    case '08':
        monthString = 'August';
        break;
    case '09':
        monthString = 'Sepetember';
        break;
    case '10':
        monthString = 'October';
        break;
    case '11':
        monthString = 'November';
        break;
    case '12':
        monthString = 'December';
        break;
    }

    const [color, setColor] = React.useState<string>('grey.500'); //default 

    React.useEffect(() => {
        getUserTags(userId).then(res => {
            const journalTags: Tag[] = []
            res.data.forEach((tag) => {
                if (tag.id != undefined) {
                    if (journal.tagIds.includes(tag.id)) {
                        journalTags.push(tag);
                    }
                }
            })
            return journalTags
        }).then(journalTags => {
            if (journalTags[0] != undefined)
                setColor(journalTags[0].color);
        })
    }, [userId]);

    React.useEffect(() => {
        (async () => {
            if (journal.id) {
                belongsToMe(userId, journal.id).then((res) => {
                    setEditPermission(res.data);
                })
            }
        })()
    }, [journal, userId]);

    const [images, setImages] = React.useState<ImageStore[]>([]);

    React.useEffect(() => {
        (async () => {
            const imgs: ImageStore[] = []
            await Promise.all(journal.imageStoreIds.map(async (imageId) => {
                const image = await getImageById(imageId)
                imgs.push(image.data)
            }))
            setImages(imgs)
        })()
    }, [journal.imageStoreIds]);

    const deletedImage = (id: number) => {
        setImages(images.filter(image => image.id !== id))
        deleteImageStoreById(id)
    }

    const [editPermission, setEditPermission] = React.useState(true);
    const handleDelete = async () => {
        if (!editPermission) {
            return;
        }

        await Promise.all(journal.imageStoreIds.map(id => {
            deleteImageStoreById(id)
        }))
        if (journal.id)
            await deleteEntry(journal.id)
        history.push('/journal')
    }

    return (
        <Card className={classes.card}>
            <Box
                borderTop={8}
                borderColor={color}
            >
                {(images.length > 0) &&
                    <ThumbnailCarousel
                        images={images}
                        imageCount={1}
                        onDelete={deletedImage}
                    />
                }
            </Box>
            <CardHeader
                title={
                    <Typography
                        style={{ fontWeight: 'bold' }}
                    >
                        {journal.title}
                    </Typography>
                }
                subheader={`${monthString} ${day}, ${year}`
                }
                action={
                    <div>
                        <IconButton
                            aria-label="Options"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={clicked}
                            keepMounted
                            open={Boolean(clicked)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                onClick={() => history.push(`/journal/edit/${journal.id}`)}
                            >
                                Edit Journal
                            </MenuItem>
                            <MenuItem onClick={handleDelete}>
                                Delete Journal
                            </MenuItem>
                        </Menu>
                    </div>
                }
            />
            <CardContent>
                <Box>
                    {(images.length > 0) &&
                        <div>
                            <Typography
                                variant='body2'
                                component="p"
                                display='block'
                                noWrap
                            >
                                {journal.description}
                            </Typography>
                        </div>
                    }

                    {(images.length == 0) &&
                        <div id='descDiv'>
                            <Typography
                                variant='body2'
                                component="p"
                                display='block'
                            >
                                {journal.description}
                            </Typography>
                        </div>
                    }
                </Box>
                <Button onClick={() => history.push(`/journal/edit/${journal.id}`)}>
                    <Typography variant='body2' >
                        Click to view more
                    </Typography>
                </Button>
            </CardContent>

        </Card>
    )
}

export default JournalCard;