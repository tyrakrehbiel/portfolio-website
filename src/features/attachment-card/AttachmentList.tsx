import React from 'react';
import { Card, Box, CardMedia, Button, Tooltip, Dialog, CardContent, Typography, Chip, Modal, Input } from '@material-ui/core';
import { ImageStore } from '../../@types';
import AddIcon from '@material-ui/icons/Add';

interface Props {
    files: ImageStore[];
    filter?: boolean;
    onDelete?: (id: number) => void;
    onFileClick?: (id: number) => void;
    onUpload?: (event: any) => void;
    isJournal?: boolean;
    truncateFileName?: boolean;
}
/**
 * 
 * @param files: An ImageStore array containing the user's attachments
 * @param filter: true filters the image files ('.png', '.jpeg', '.jpg', '.gif', '.bmp', '.tiff', '.tif') 
 * from display; false displays all attachments
 * @param onDelete: (Optional) this function is responsible for handling deletion when somone clicks the x,
 * takes id of the image
 * @param onClick: (Optional) function that is called with the id number of the image that was clicked
 * @param onUpload: (Optional) function that is called when user hits the upload button, responsible
 * for processing uploads
 * 
 * width and height can be controlled with scss classes (name for component: attachment-card)
 * NOTE: MUST USE overflow-y: scroll; IN SCSS FILE SO THAT USE CAN SCROLL WHEN CARD IS FULL OF TAGS !!!
 */

export const AttachmentList: React.FC<Props> = ({ files, filter, onDelete, onFileClick, onUpload, truncateFileName, isJournal }) => {

    const [clickedFile, setClickedFile] = React.useState({
        id: 0,
        url: ''
    })
    const [open, setOpen] = React.useState(false);
    const [imageStore, setImageStore] = React.useState<ImageStore[]>([]);

    React.useEffect(() => {
        //Create new array with files that DO NOT have the follow file extensions:
        const extensions = ['.png', '.jpeg', '.jpg', '.gif', '.bmp', '.tiff', '.tif'];

        if (filter) {
            const filteredFiles = files.filter(file => {
                const fileExtIndex = file.filename.lastIndexOf('.');
                const fileExt = file.filename.substring(fileExtIndex)
                if (extensions.includes(fileExt) === false) {
                    return file
                }

            })
            setImageStore(filteredFiles);
        }

        else {
            setImageStore(files);
        }

    }, [files]);


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

    const displayFull = (urlString: string, fileId?: number) => () => {
        if (fileId) {
            setClickedFile({ id: fileId, url: urlString })
            setOpen(true)
            if (onFileClick) {
                onFileClick(fileId)
            }
        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = (file: ImageStore) => () => {
        setOpen(false)
        // console.log('clicked delete in attachmentCard '+ file.filename)
        //deleteImageStoreById(idx);
        setImageStore(imageStore.filter(image => image.id !== file.id))
        if (onDelete) {
            // console.log('should call onDelete');
            if (file.id)
                onDelete(file.id);
        }
    }

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onUpload) {
            console.log('should call onDelete');
            onUpload(event);
        }
    }
    const getFileName = (fileName: string) => {
        if (truncateFileName)
            if (fileName.length > 25)
                return fileName.substring(0, 23) + '...'
        return fileName
    }

    return (
        <Box className='attachment-card-box'>
            <div style={{
                display: 'flex',
            }}>
                <Button
                    component="label"
                    variant='outlined'
                    style={{borderRadius: '8px'}}
                    startIcon={<AddIcon />}
                >
                    <Typography>Add Attachments</Typography>
                    <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleUpload}
                    />
                </Button>
            </div>
            {imageStore.map((file: ImageStore) => {
                const url = getUrlFromImage(file)
                return (
                    <Tooltip key={file.id} title={file.filename}>
                        <span>
                            <Chip
                                style={{ marginRight: '5px' }}
                                label={getFileName(file.filename)}
                                onClick={displayFull(url, file.id)}
                                onDelete={handleDelete(file)} />
                        </span>
                    </Tooltip>)
            })}
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} maxWidth='md' className='multi-carousel-dialog'>
                <Card>
                    <CardMedia
                        src={clickedFile.url}
                        component="img"
                        className='attachment-card-media'
                    />
                </Card>
            </Dialog>
        </Box>
    )
}

export default AttachmentList;
