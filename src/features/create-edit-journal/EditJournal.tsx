import React from 'react';

import { useHistory, useParams } from 'react-router-dom';

import '../event-modal/_CreateEventModal.scss';
import { Entry, ImageStore, Tag } from '../../@types';
import { updateEntry, getEntryById, deleteEntry, belongsToMe } from '../../axios/entries';
import { useAppSelector } from '../../store/hooks';
import { getUserTags } from '../../axios/tags';
import { createImageStore, deleteImageStoreById, getImageById } from '../../axios/imageStores';
import EntryTagChips from '../entry-tag-chips/EntryTagChips';
import MemoizedThumbnailCarousel from '../thumbnail-carousel/ThumbnailCarousel';
import ImageStoreCarousel from './ImageStoreCarousel'
import DeleteIcon from '@material-ui/icons/Delete';
import AttachmentCard from '../attachment-card/AttachmentCard'
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateFnsUtils from '@date-io/date-fns';
import {
    BForm,
    BSubmit,
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
import './_CreateEditJournal.scss';
import { addUserTag } from '../../axios/user';
import EditErrorBar from '../../common/snackbars/EditErrorBar';


interface RouteParams {
    entryId: string;
}

export const EditJournal: React.FC = () => {
    const { entryId } = useParams<RouteParams>();
    const userId = useAppSelector(store => store.user.user.id);

    const journalId: number = +entryId;
    const [images, setImages] = React.useState<ImageStore[]>([]);
    const [imagesToUpload, setImagesToUpload] = React.useState<ImageStore[]>([]);
    const [imageIdsToDelete, setImageIdsToDelete] = React.useState<number[]>([]);

    const [selectedDate, setSelectedDate] = React.useState(new Date());

    const [editPermission, setEditPermission] = React.useState(true);
    const [showEditErrorBar, setShowEditErrorBar] = React.useState(false);

    const [primaryTag, setPrimaryTag] = React.useState(0);
    const [userTags, setUserTags] = React.useState<Tag[]>([]);
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);

    const [dateDisplayStatus, setDateDisplayStatus] = React.useState<React.CSSProperties>({ display: 'none' })
    const [locationDisplayStatus, setLocationDisplayStatus] = React.useState<React.CSSProperties>({ display: 'none' })


    type dateStringType = 'long' | 'short' | 'narrow' | undefined;
    type dateNumberType = 'numeric' | '2-digit' | undefined;
    const dateOptions = {
        weekday: 'long' as dateStringType,
        year: 'numeric' as dateNumberType,
        month: 'long' as dateStringType,
        day: 'numeric' as dateNumberType
    };

    const history = useHistory();
    const [entry, setEntry] = React.useState<Entry>(
        {
            id: journalId,
            title: '',
            recurrenceId: undefined,
            entryType: '',
            startDateTime: '',
            endDateTime: '',
            description: '',
            location: '',
            fieldList: '',
            tagIds: [],
            imageStoreIds: [],
            primaryTagId: undefined
        }
    );


    const initialValues = {
        id: entry.id,
        title: entry.title,
        recurrenceId: entry.recurrenceId,
        entryType: entry.entryType,
        startDateTime: entry.startDateTime,
        endDateTime: entry.endDateTime,
        description: entry.description,
        fieldList: entry.fieldList,
        tagIds: entry.tagIds,
        imageStoreIds: entry.imageStoreIds,
        location: entry.location
    };


    // Get Current Entry and User Tags
    React.useEffect(() => {
        (async () => {
            if (userId) {
                //Get the Journal
                const jresponse = await getEntryById(journalId)
                setEntry(jresponse.data)
                if (jresponse.data.primaryTagId)
                    setPrimaryTag(jresponse.data.primaryTagId)
                //Get User's Tags
                const tresponse = await getUserTags(userId)
                setUserTags(tresponse.data)

                // check ownership
                if (jresponse.data.id) {
                    belongsToMe(userId, jresponse.data.id).then((res) => {
                        // save permissions and show error bar
                        setEditPermission(res.data);
                        setShowEditErrorBar(!res.data);
                    })
                }

            }
        })()
    }, []);
    React.useEffect(() => {
        if (entry.primaryTagId) {
            setPrimaryTag(entry.primaryTagId)
        }
    }, [entry.primaryTagId])

    React.useEffect(() => {
        setSelectedDate(new Date(entry.startDateTime))
    }, [entry.startDateTime])

    React.useEffect(() => {
        (async () => {
            const imgs: ImageStore[] = []
            await Promise.all(entry.imageStoreIds.map(async (imageId) => {
                const image = await getImageById(imageId)
                imgs.push(image.data)
            }))
            setImages(imgs)
        })()

    }, [entry.imageStoreIds]);
    //Tagging Hook 
    /**
     * This function compares the entry.tagIds array and the userTags array 
     * and populates the entryTags array 
     */
    React.useEffect(() => {
        setEntryTags(userTags.filter(tag => {
            if (tag.id)
                return entry.tagIds.includes(tag.id)
        }))
    }, [userTags, entry.tagIds]);


    const validate = (values: any): { [k: string]: string } => {
        const errors: { [k: string]: string } = {};
        if (values.title === '') {
            errors.title = 'Title cannot be empty';
        }
        return errors;
    }

    const readAsBytes = async (file: File) => {
        const fileByteArray = [] as number[]
        const buffer = await file.arrayBuffer();
        const readFile = new Uint8Array(buffer)
        for (let i = 0; i < readFile.length; i++) {
            fileByteArray.push(readFile[i]);
        }
        return fileByteArray
    };

    const validatePrimaryTag = () => {
        // if no tags, primary tag is undefined
        if (entryTags.length === 0) {
            setEntry({ ...entry, primaryTagId: undefined })
        }
        // if tags but primary tag isn't set, the event doesn't have a primary Id already, set to first of tag list
        if (entryTags.length > 0 && primaryTag === 0) {
            if (entry.primaryTagId === undefined || entry.primaryTagId === null) {
                setEntry({ ...entry, primaryTagId: entry.tagIds[0] })
            }
        }
        // if primary tag isn't 0, the primary tag has changed, set it to that value
        if (entryTags.length > 0 && primaryTag !== 0) {
            setEntry({ ...entry, primaryTagId: primaryTag })
        }
        // else don't need to do anything because the event has a primary tag and it hasn't changed

    }

    const getIdsFromArray = (tags: Tag[]) => {
        const ids: number[] = tags.filter(tag => tag.id !== undefined).map(tag => Number(tag.id))
        return ids
    }

    // Tagging Functions
    /**
     * This function creates the tag in the backend,
     *  reloads the userTag array from the backend and sets the state hook
     * @param tagId tag Id of the tag to be added to the user for the QuickCreateTag component
     */
    const addTagToUser = async (tagId: number) => {
        if (userId) {
            await addUserTag(Number(userId), tagId)
            const tagResponse = await getUserTags(Number(userId))
            setUserTags(tagResponse.data)
        }
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
        if (id) {
            setPrimaryTag(id)
            setEntry({ ...entry, primaryTagId: id })
        }
    }

    const handleDelete = async () => {

        if (!editPermission) {
            setShowEditErrorBar(true);
            return;
        }

        await Promise.all(entry.imageStoreIds.map(id => {
            deleteImageStoreById(id)
        }))
        if (entry.id)
            await deleteEntry(entry.id)
        history.push('/journal')
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

        return new Date(selectedDate).toLocaleDateString(undefined, dateOptions)
    }

    const toggleEditLocation = () => {
        if (locationDisplayStatus.display === 'none')
            setLocationDisplayStatus({ display: 'block' })
        else
            setLocationDisplayStatus({ display: 'none' })
    }


    const getLocationString = () => {
        if (entry.location === '')
            return <> No Location </>
        else
            return entry.location
    }


    const timezoneFix = (date: Date) => {
        const newDate = date;
        const offset = newDate.getTimezoneOffset() / 60;
        const hours = newDate.getHours();
        newDate.setHours(hours - offset);
        return newDate
    }

    const getEndDateTime = () => {
        const endTime = new Date(selectedDate)
        endTime.setSeconds(endTime.getSeconds() + 60)
        return endTime
    }
    const handleDateChange = (date: MaterialUiPickersDate, value?: string | null | undefined) => {
        if (date)
            setSelectedDate(date)
    }

    const handleChange = (name: keyof Entry) => (event: React.ChangeEvent<HTMLInputElement>) => {

        setEntry({ ...entry, [name]: event.target.value });

    };

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
    const handleSubmit = async (values: any) => {

        if (!editPermission) {
            setShowEditErrorBar(true);
            return;
        }

        const filteredIds = entry.imageStoreIds.filter(id => {
            // if included in ToDelete, filter it out, else keep it
            return (imageIdsToDelete.includes(id) ? false : true)
        })
        const newIds = await imageStoreSubmit(imagesToUpload)
        const idsToSubmit = filteredIds.concat(newIds)


        validatePrimaryTag()
        updateEntry({
            ...entry,
            tagIds: getIdsFromArray(entryTags),
            imageStoreIds: idsToSubmit,
            startDateTime: timezoneFix(selectedDate).toISOString(),
            endDateTime: timezoneFix(getEndDateTime()).toISOString()
        }).then(res => {
            setEntry(res.data);
            //history.push('/journal/edit/' + entry.id);
            history.goBack();
        });


        //first deleting any imageStores which need to be deleted
        Promise.all(imageIdsToDelete.map(async (imageId) => {
            const id = Number(imageId);
            const response = await deleteImageStoreById(id);
        }))
    }


    return (

        <Box className='create-edit-journal-root'>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validate={validate}
                validateOnChange={false}
                enableReinitialize
            >
                <BForm >
                    <Box className='grid'>
                        <Box className='header'>
                            <Grid container>
                                <Grid item xs={11}>
                                    <InputBase
                                        name="title"
                                        placeholder="Add Journal Title"
                                        required
                                        value={entry.title}
                                        margin="dense"
                                        onChange={handleChange('title')}
                                        id='title'
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <Button aria-label='delete-entry' onClick={handleDelete} className='delete-button'> <DeleteIcon /> </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <EntryTagChips clickedPrimary={handleTagClicked} primaryTag={primaryTag} userTags={userTags} entryTags={entryTags} addTag={addTag} addTagToUser={addTagToUser} deleteTag={deleteTag} />
                                </Grid>
                            </Grid>
                            <Box id='date-time-recurrence'>
                                <Grid container>
                                    <Grid item xs={12}>
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
                                {/* carousel*/}
                                <Grid item xs={6} className='carousel-grid-item'>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            {
                                                images.concat(imagesToUpload).length !== 0 ? <ImageStoreCarousel clickFullSize images={images.concat(imagesToUpload)} /> : null
                                            }
                                        </Grid>
                                        <Grid item xs={12}>
                                            {((images.concat(imagesToUpload)).length > 0) &&
                                                <MemoizedThumbnailCarousel images={images.concat(imagesToUpload)} imageCount={8} />
                                            }
                                        </Grid>
                                        <Grid item xs={12}>
                                            <AttachmentCard isJournal files={images.concat(imagesToUpload)} onDelete={handleDeleteFile} onUpload={handleUpload} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box className='grid-mid '>

                        </Box>

                        <Box className='c-s-btns'>
                            <Button id='cancel-btn' aria-label='cancel' onClick={() => history.push('/journal')}>Cancel</Button>
                            <BSubmit id='save-btn' aria-label='create' disabled={!editPermission}>Save</BSubmit>
                        </Box>



                    </Box>
                </BForm>
            </Formik>
            <EditErrorBar open={showEditErrorBar} setShowEditErrorBar={setShowEditErrorBar} />
        </Box >
    );
};
export default EditJournal;
