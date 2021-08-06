import React from 'react';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import { Card, Box, CardMedia, Button, CardActions, Dialog, CardActionArea } from '@material-ui/core';
import { ImageStore } from '../../@types';
import { deleteImageStoreById } from '../../axios/imageStores';

interface Props {
    images: ImageStore[];
    imageCount?: number;
    onDelete?: (id: number) => void;
    onImageClick?: (id: number) => void;
}
/**
 * 
 * @param images: An ImageStore array containing the images that will be displayed: 
 * filetypes displayed are: '.png', '.jpeg', '.jpg', '.gif', '.bmp', '.tiff', '.tif'
 * @param imageCount: (Optional) The number of images or attachments to be displayed, the default is 3
 * @param onDelete: (Optional) function that is called with the Id number of the deleted imageStore
 * @param onClick: (Optional) function that is called with the id number of the image that was clicked
 * 
 * Suggested that the width and height of the component are controlled through css classes:
 * the entire component is in multi-carousel-box, the images are displayed on a card multi-image-card
 */
export const ThumbnailCarousel: React.FC<Props> = ({ images, imageCount, onDelete, onImageClick }) => {

    const [index, setIndex] = React.useState(0);
    const numSlides = images.length;
    const [clickedImg, setClickedImg] = React.useState({
        id: 0,
        url: ''
    })
    const [open, setOpen] = React.useState(false);
    const [displayImages, setDisplayImages] = React.useState<ImageStore[]>([]);
    const [imageStore, setImageStore] = React.useState<ImageStore[]>([]);
    const [numOfDisplayImg, setNumOfDisplayImg] = React.useState(3)

    React.useEffect(() => {
        //Create new array with files that have the follow file extensions:
        const extensions = ['.png', '.jpeg', '.jpg', '.gif', '.bmp', '.tiff', '.tif'];

        const filteredImgs = images.filter(image => {
            const fileExtIndex = image.filename.lastIndexOf('.');
            const fileExt = image.filename.substring(fileExtIndex)
            if (extensions.includes(fileExt) === true) {
                return image
            }

        })
        setImageStore(filteredImgs)


        if (imageCount)
            setNumOfDisplayImg(imageCount)



    }, [images]);

    React.useEffect(() => {
        const imgs: ImageStore[] = [];
        imgs.push(imageStore[index])
        if (numOfDisplayImg < imageStore.length) {
            let nextIdx = (index + 1 + numSlides) % numSlides
            for (let i = 1; i < numOfDisplayImg; i++) {
                imgs.push(imageStore[nextIdx])
                nextIdx = (nextIdx + 1 + numSlides) % numSlides
            }
            setDisplayImages(imgs)

        }
        else {
            setDisplayImages(imageStore)
        }


    }, [index, imageStore])

    function bufferToBase64(buf: any) {
        const binstr = Array.prototype.map.call(buf, function (ch) {
            return String.fromCharCode(ch);
        }).join('');
        return btoa(binstr);
    }

    const getUrlFromImage = (image: ImageStore) => {
        if (Array.isArray(image.image) === false)
            return `data:image/jpg;base64,${image.image}`
        else {
            const base64Data = bufferToBase64(image.image)
            return `data:image/jpg;base64,${base64Data}`
        }
    }

    function Arrow(props: any) {
        const { direction, clickFunction } = props;
        const icon = direction === 'left' ? <ChevronLeftOutlinedIcon /> : <ChevronRightOutlinedIcon />;

        return <Button onClick={clickFunction}>{icon}</Button>;
    }


    const onArrowClick = (direction: string) => {
        const increment = direction === 'left' ? -1 : 1;
        const newIndex = (index + increment + numSlides) % numSlides;
        setIndex(newIndex);
    };

    const displayFull = (urlString: string, imageId?: number) => {
        if (imageId) {
            setClickedImg({ id: imageId, url: urlString })
            setOpen(true)
            if (onImageClick) {
                onImageClick(imageId)
            }
        }

    }
    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = (idx: number) => {
        setOpen(false)
        //deleteImageStoreById(idx);
        //setImageStore(imageStore.filter(image => image.id !== idx))
        if (onDelete)
            onDelete(idx)

    }
    return (
        <Box className='multi-carousel-box'>
            <Card elevation={0} className='multi-carousel-card'
                style={{
                    display: 'flex',
                    flexWrap: 'nowrap'
                }}>
                {(images.length > numOfDisplayImg) &&
                    <CardActions>
                        <Arrow direction='left' clickFunction={() => onArrowClick('left')} />
                    </CardActions>}
                {displayImages.map(image => {
                    const url = getUrlFromImage(image)
                    return (
                        <CardMedia key={'multi-carousel-card' + image.id}
                            style={{
                                minWidth: '10%',
                                maxWidth: '80%',
                                minHeight: '100%',
                                objectFit: 'scale-down',
                            }}
                            component="img"
                            src={url}
                            onClick={() => displayFull(url, image.id)}
                        />
                    )



                })}{(images.length > numOfDisplayImg) &&
                    <CardActions>
                        <Arrow direction='right' clickFunction={() => onArrowClick('right')} />
                    </CardActions>}
            </Card>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} maxWidth='md' className='multi-carousel-dialog'>
                <Card>
                    <CardActionArea>

                        <CardMedia src={clickedImg.url}
                            component="img"
                            style={{
                                maxHeight: '90vh',
                                objectFit: 'scale-down',
                            }} />
                    </CardActionArea>
                    {(onDelete) &&
                        <CardActions>
                            <Button className='delete-btn' onClick={() => handleDelete(clickedImg.id)}  >Delete</Button>
                        </CardActions>
                    }
                </Card>
            </Dialog>
        </Box >
    )
}

export default ThumbnailCarousel;

export const MemoizedThumbnailCarousel = React.memo(ThumbnailCarousel);

