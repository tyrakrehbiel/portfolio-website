import React from 'react';

import '../event-modal/_CreateEventModal.scss';
import { Entry, Tag, ImageStore } from '../../@types';
import { createEntry } from '../../axios/entries';
import { getUserTags } from '../../axios/tags';
import { useAppSelector } from '../../store/hooks';
import { addUserEntry, addUserTag } from '../../axios/user';
import { createImageStore } from '../../axios/imageStores';
import {
    BForm,
} from 'mui-bueno';
import { Formik } from 'formik';
import {
    Button,
    Typography,
    TextField,
    Card,
    CardContent,
    Grid,
    Box,
    InputBase,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import EntryTagChips from '../entry-tag-chips/EntryTagChips';
import MemoizedThumbnailCarousel from '../thumbnail-carousel/ThumbnailCarousel';
import ImageStoreCarousel from './ImageStoreCarousel';
import AttachmentCard from '../attachment-card/AttachmentCard';
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateFnsUtils from '@date-io/date-fns';





export const CreateJournal: React.FC = () => {
    const tokenId = useAppSelector(store => store.user.user.id);
    const [userId, setUserId] = React.useState<number>(0);
    const [createDate, setCreateDate] = React.useState<string>('');
    const [primaryTag, setPrimaryTag] = React.useState(0)
    const [images, setImages] = React.useState<ImageStore[]>([]);
    const [imagesToUpload, setImagesToUpload] = React.useState<ImageStore[]>([]);
    const [imageIdsToDelete, setImageIdsToDelete] = React.useState<number[]>([]);
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [locationDisplayStatus, setLocationDisplayStatus] = React.useState<React.CSSProperties>({ display: 'none' })
    const [dateDisplayStatus, setDateDisplayStatus] = React.useState<React.CSSProperties>({ display: 'none' })

    //Setting up tag selector UI:
    const [userTags, setUserTags] = React.useState<Tag[]>([]);
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);

    const history = useHistory();
    const [entry, setEntry] = React.useState<Entry>(
        {
            id: undefined,
            title: '',
            recurrenceId: undefined,
            entryType: 'Journal',
            startDateTime: '1970-01-01T00:00:00',
            endDateTime: '',
            description: '',
            fieldList: '',
            tagIds: [],
            imageStoreIds: [],
            location: '',
            primaryTagId: undefined
        }
    );

    const initialValues = {
        id: undefined,
        title: '',
        recurrenceId: undefined,
        entryType: 'Journal',
        startDateTime: { createDate },
        description: '',
        fieldList: '',
        tagIds: [],
        imageStoreIds: [],
        location: '',
        fileOne: new File([], ''),
    };
    type dateStringType = 'long' | 'short' | 'narrow' | undefined;
    type dateNumberType = 'numeric' | '2-digit' | undefined;
    const dateOptions = {
        weekday: 'long' as dateStringType,
        year: 'numeric' as dateNumberType,
        month: 'long' as dateStringType,
        day: 'numeric' as dateNumberType
    };

    React.useEffect(() => {
        if (tokenId) {
            setUserId(tokenId)
        }
        const currentDateTime = new Date(Date.now());
        setCreateDate(currentDateTime.toISOString().split('.')[0])

    }, []);

    React.useEffect(() => {
        // endTime of a journal is just 10 seconds later to prevent drag and drop from breaking
        let endTimeString = '1970-01-01T00:00:00'
        if (createDate) {
            const endTime = new Date(createDate + 'Z')
            endTime.setSeconds(endTime.getSeconds() + 10);
            endTimeString = endTime.toISOString().split('.')[0]
        }
        setEntry({
            ...entry,
            startDateTime: createDate,
            endDateTime: endTimeString


        })
    }, [createDate])

    React.useEffect(() => {
        (async () => {
            if (tokenId) {
                setUserId(tokenId)
                //Get User's Tags
                const tresponse = await getUserTags(tokenId)
                setUserTags(tresponse.data)
            }
        })()
    }, []);



    const validate = (values: any): { [k: string]: string } => {
        const errors: { [k: string]: string } = {};
        if (values.title === '') {
            errors.title = 'Title cannot be empty';
        }
        return errors;
    }

    /**
     * 
     * @param file 
     * @returns returns the file data in byte[] format (actually number[] but they are treated the same)
     */
    const readAsBytes = async (file: File) => {
        const fileByteArray = [] as number[]
        const buffer = await file.arrayBuffer();
        const readFile = new Uint8Array(buffer)
        for (let i = 0; i < readFile.length; i++) {
            fileByteArray.push(readFile[i]);
        }
        return fileByteArray
    };


    const getIdsFromArray = (tags: Tag[]) => {
        const ids: number[] = tags.filter(tag => tag.id !== undefined).map(tag => Number(tag.id))

        return ids

    }
    const getLocationString = () => {
        if (entry.location === '')
            return <> No Location </>
        else
            return entry.location
    }

    const getEndDateTime = (date: Date) => {
        const endTime = date
        endTime.setSeconds(endTime.getSeconds() + 60)
        return endTime
    }

    const timezoneFix = (date: Date) => {
        const newDate = date;
        const offset = newDate.getTimezoneOffset() / 60;
        const hours = newDate.getHours();
        newDate.setHours(hours - offset);
        return newDate
    }

    // Get Current Entry and User Tags
    // Tagging Functions
    /**
     * This function creates the tag in the backend,
     *  reloads the userTag array from the backend and sets the state hook
     * @param tagId tag Id of the tag to be added to the user for the QuickCreateTag component
     */
    const addTagToUser = async (tagId: number) => {
        await addUserTag(Number(userId), tagId)
        const tagResponse = await getUserTags(Number(userId))
        setUserTags(tagResponse.data)
    }

    /**
     * This function removes the selected tag from the entryTags array
     * @param id tag id of the tag that is supposed to be removed from the entry
     */
    const deleteTag = (id: number | undefined) => {
        if (id) {
            setEntryTags(entryTags.filter(tag => tag.id !== id))
            if (id === entry.primaryTagId) {

                setEntry({ ...entry, primaryTagId: undefined })
                setPrimaryTag(0)
            }
        }
    }
    /**
     * This function adds the selected tag to the entryTags array
     * @param id tag id of the tag that is supposed to be removed from the entry
     */
    const addTag = (id: number | undefined) => {
        if (id) {
            const newTag = userTags.find(tag => tag.id == id) // Using the tagId, gets the tag object from userTags
            if (newTag) {
                const nonExist = entryTags.find(tag => tag.id == newTag.id) // if the tag is already in entryTags[], don't add it
                if (nonExist === undefined) {
                    setEntryTags([...entryTags, newTag])
                }
            }
        }
    }

    const handleTagClicked = (id: number) => {
        if (id)
            setPrimaryTag(id)
        setEntry({ ...entry, primaryTagId: id })
    }

    const handleDeleteFile = (fileId: number) => {

        //remove the image from images to upload
        const newImages: ImageStore[] = imagesToUpload.filter(image => image.id !== fileId)
        setImagesToUpload(newImages);

        //add the image id to image ids to delete
        const imagesDeleteQueue = images.filter(image => image.id === fileId)
        const ids: number[] = imagesDeleteQueue.filter(image => image.id !== undefined).map(image => Number(image.id))
        setImageIdsToDelete(imageIdsToDelete.concat(ids))

        //remove the image from images (if it was in the backend)
        setImages(images.filter(image => image.id !== fileId));
    };


    const imageStoreSubmit = async (files: ImageStore[]) => {
        const newImgIds: number[] = []
        await Promise.all(files?.map(async (file) => {
            const response = await createImageStore({
                id: undefined,
                filename: file.filename,
                image: file.image
            })
            if (response.data.id)
                newImgIds.push(response.data.id)
        }))
        return newImgIds
    }

    //temporary img ids to create ImageStores with
    const tempImgId = (): number => {
        //might not need this? 
        const tempId = Math.floor(Math.random() * (99999 - 9999 + 1) + 9999);
        const toUploadIds = [] as number[];
        imagesToUpload.map(image => toUploadIds.push(image.id!));
        if (entry.imageStoreIds.includes(tempId) || toUploadIds.includes(tempId))
            return tempImgId();
        else return tempId;
    }


    const toggleDateTimeEdit = () => {
        if (dateDisplayStatus.display === 'none')
            setDateDisplayStatus({ display: 'block' })
        else
            setDateDisplayStatus({ display: 'none' })
    }

    const getDateString = () => {

        return new Date(entry.startDateTime).toLocaleDateString(undefined, dateOptions)
    }
    const toggleEditLocation = () => {
        if (locationDisplayStatus.display === 'none')
            setLocationDisplayStatus({ display: 'block' })
        else
            setLocationDisplayStatus({ display: 'none' })
    }

    const handleDateChange = (date: MaterialUiPickersDate, value?: string | null | undefined) => {
        if (date)
            setSelectedDate(date)
    }
    
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newImgList: ImageStore[] = []
        if (event) {
            if (event.target.files) {
                const files = event.target.files
                for (let i = 0; i < files.length; i++) {
                    const newFile = files.item(i)
                    if (newFile !== null) {
                        const imageData = await readAsBytes(newFile);
                        const newImg: ImageStore = {
                            id: tempImgId(),
                            filename: newFile.name,
                            image: imageData
                        }

                        newImgList.push(newImg)

                    }
                }


            }
            setImagesToUpload(imagesToUpload.concat(newImgList))
        }
    }
    const handleChange = (name: keyof Entry) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (name == 'startDateTime') {
            const endTime = new Date(event.target.value + 'Z')
            endTime.setSeconds(endTime.getSeconds() + 10);
            const endTimeString = endTime.toISOString().split('.')[0]
            setEntry({ ...entry, [name]: event.target.value, endDateTime: endTimeString });
        }
        else {
            setEntry({ ...entry, [name]: event.target.value });
        }
    };

    const handleSubmit = async (values: typeof initialValues) => {
        const imgIds = await imageStoreSubmit(imagesToUpload)
        createEntry({
            ...entry, imageStoreIds: imgIds,
            tagIds: getIdsFromArray(entryTags),
            startDateTime: timezoneFix(selectedDate).toISOString(),
            endDateTime: timezoneFix(getEndDateTime(selectedDate)).toISOString()
        }).then(res => {
            setEntry(res.data);
            if (res.data.id)
                addUserEntry(userId, res.data.id).then(() => {
                    history.push('/journal');
                });

        });
    }


    return (

        <Box className='create-edit-journal-root'>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                //validate={validate}
                //validateOnChange={false}
                enableReinitialize
            >
                <BForm >
                    <Box className='grid'>
                        <Box className='header'>
                            <InputBase
                                name="title"
                                placeholder="Add Journal Title"
                                required
                                value={entry.title}
                                margin="dense"
                                onChange={handleChange('title')}
                                id='title'
                                fullWidth
                            />
                            <Grid container>
                                <Grid item xs={11}>
                                    <EntryTagChips clickedPrimary={handleTagClicked} primaryTag={primaryTag} userTags={userTags} entryTags={entryTags} addTag={addTag} addTagToUser={addTagToUser} deleteTag={deleteTag} />

                                </Grid>
                            </Grid>
                            <Box id='date-time-recurrence'>
                                <Grid container>
                                    <Grid item xs={12} >
                                        <Button id='date' onClick={toggleDateTimeEdit}>{getDateString()}</Button>

                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDateTimePicker
                                                style={dateDisplayStatus}
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                label="Journal Date"
                                                format="MM/dd/yyyy hh:mm a"
                                            />

                                        </MuiPickersUtilsProvider>
                                    </Grid>
                                    <Grid item >
                                        <Button id='date' onClick={toggleEditLocation}>{getLocationString()}</Button>
                                        <TextField
                                            style={locationDisplayStatus}
                                            id="location-text"
                                            label="Location"
                                            name="location"
                                            type="text"
                                            placeholder='Enter Location'
                                            onChange={handleChange('location')}
                                            value={entry.location}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                        <Box className='grid-main '>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Card className='description' elevation={5}>
                                        <CardContent>
                                            <Typography className='title-card' variant="h6" component="h2">
                                                Description
                                            </Typography>
                                            <TextField
                                                name='description'
                                                required
                                                multiline
                                                fullWidth
                                                rows={35}
                                                onChange={handleChange('description')}
                                                defaultValue={initialValues.description}
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            {
                                                images.concat(imagesToUpload).length !== 0 ? <ImageStoreCarousel clickFullSize images={images.concat(imagesToUpload)} /> : null
                                            }
                                        </Grid>
                                        <Grid item xs={12}>
                                            <MemoizedThumbnailCarousel images={images.concat(imagesToUpload)} imageCount={3} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <AttachmentCard files={images.concat(imagesToUpload)} onDelete={handleDeleteFile} onUpload={handleUpload} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box className='grid-mid '>
                        </Box>
                        <Box className='c-s-btns'>
                            <Button id='cancel-btn' aria-label='cancel' onClick={() => history.goBack()}>Cancel</Button>
                            <Button id='save-btn' aria-label='create' type='submit'>Save</Button>
                        </Box>
                    </Box>
                </BForm>
            </Formik>

        </Box >
    );
};
export default CreateJournal;
