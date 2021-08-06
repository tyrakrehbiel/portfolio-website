import React from 'react';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import { Card, makeStyles, CardMedia, Button, CardActions, Dialog } from '@material-ui/core';
import { ImageStore } from '../../@types';

interface Props {
    images: ImageStore[];
    clickFullSize?: boolean
}

export const ImageStoreCarousel: React.FC<Props> = ({ images, clickFullSize }) => {

    const [index, setIndex] = React.useState(0);
    const numSlides = images.length;
    const [open, setOpen] = React.useState(false);
    const [imgUrl, setImgUrl] = React.useState<string | undefined>('')
    React.useEffect(() => {
        //Remove any non-images from carousel
        const extensions = ['.png','.jpeg','.jpg','.gif','.bmp','.tiff','.tif'];

        images.map(image=>{
            const fileExtIndex = image.filename.lastIndexOf('.');
            const fileExt = image.filename.substring(fileExtIndex)
            if(extensions.includes(fileExt) === false){
                images.splice(images.indexOf(image),1)
            }
        })
        parseImgUrl()
    }, [images]);

    function bufferToBase64(buf: any) {
        const binstr = Array.prototype.map.call(buf, function (ch) {
            return String.fromCharCode(ch);
        }).join('');
        return btoa(binstr);
    }

    const parseImgUrl = () =>{ 
        if(images.length > index)
            if(images[index].image !== null)
                setImgUrl (getUrlFromImage(images[index]))

    }

    const getUrlFromImage = (image: ImageStore) => {
        if(Array.isArray(image.image) === false)
            return `data:image/jpg;base64,${image.image}`
        else{
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
        parseImgUrl()
    };

    const displayFull = () => {
        if (clickFullSize)
            setOpen(true)
    }
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <React.Fragment>
            <Card elevation={0} className='carousel grey-bg'>
                <CardActions>
                    <Arrow direction='left' clickFunction={() => onArrowClick('left')} />
                </CardActions>
                <CardMedia
                    style={{
                        minWidth:'80%',
                        width:'80%',
                        maxWidth: '80%',
                        objectFit: 'scale-down',
                    }}
                    component="img"
                    src={imgUrl}
                    onClick={displayFull}
                />
                <CardActions>
                    <Arrow direction='right' clickFunction={() => onArrowClick('right')} />
                </CardActions>
            </Card>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} maxWidth='lg'>
                <Card>
                    <CardMedia src={imgUrl}
                        component="img" 
                        style={{
                            objectFit: 'scale-down',
                        }}/>
                </Card>
            </Dialog>
        </React.Fragment>
    )
}

export default ImageStoreCarousel;
