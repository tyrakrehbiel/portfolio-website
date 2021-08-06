import React, { FunctionComponent } from 'react';

import '../event-modal/_CreateEventModal.scss';
import { Entry, Tag, ImageStore, CalendarEntry } from '../../@types';
import { createEntry } from '../../axios/entries';
import { getUserTags } from '../../axios/tags';
import { useAppSelector } from '../../store/hooks';
import { addUserEntry, addUserTag } from '../../axios/user';
import { createImageStore } from '../../axios/imageStores';
import AttachmentCard from '../attachment-card/AttachmentCard';
import AttachmentList from '../attachment-card/AttachmentList';
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateFnsUtils from '@date-io/date-fns';
import {
    BForm,
    BGrid
} from 'mui-bueno';
import { Formik } from 'formik';
import {
    Button,
    Typography,
    TextField,
    Card,
    CardContent,
    CardActions,
    Grid,
    IconButton,
    InputBase,
    Tooltip
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FullscreenOutlinedIcon from '@material-ui/icons/FullscreenOutlined';
import { useHistory } from 'react-router-dom';
import EntryTagChips from '../entry-tag-chips/EntryTagChips';
import { eventToCalEvent } from '../../common/calendar-utils/CalendarUtils';

interface ModalProps {
    //userId: number;
    addEntry: (entryId: number) => Promise<any>;
    handleModalClose: () => void;
    modalOpen: boolean;
    setFilteredEntries?: React.Dispatch<React.SetStateAction<CalendarEntry[]>>;
    filteredEntries?: CalendarEntry[]
    updateCalendar?: (entry: Entry) => void; //this will update the year calendar
}

export const CreateJournalModal: FunctionComponent<ModalProps> = (props) => {
    const updateCalendar = props.updateCalendar;
    const modalOpen = props.modalOpen;
    const handleModalClose = props.handleModalClose;
    const dayClicked = useAppSelector(store => store.selectedDate.date)
    const tokenId = useAppSelector(store => store.user.user.id);
    const [userId, setUserId] = React.useState<number>(0);
    const [primaryTag, setPrimaryTag] = React.useState(0)
    const titleInputRef = React.useRef<HTMLInputElement>(null)
    const [userTags, setUserTags] = React.useState<Tag[]>([]);
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);
    const [imagesToUpload, setImagesToUpload] = React.useState<ImageStore[]>([]);
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [dateDisplayStatus, setDateDisplayStatus] = React.useState<React.CSSProperties>({ display: 'none' })
    let willExpand = false;
    const history = useHistory();

    type dateStringType = 'long' | 'short' | 'narrow' | undefined;
    type dateNumberType = 'numeric' | '2-digit' | undefined;
    const dateOptions = {
        weekday: 'long' as dateStringType,
        year: 'numeric' as dateNumberType,
        month: 'long' as dateStringType,
        day: 'numeric' as dateNumberType
    };


    const [newJournal, setNewJournal] = React.useState<Entry>(
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
        startDateTime: '',
        description: '',
        fieldList: '',
        tagIds: [],
        imageStoreIds: [],
        location: '',
        fileOne: new File([], ''),
    };
    React.useEffect(() => {
        if (titleInputRef.current !== null) {
            titleInputRef.current.focus()
        }
    }, [modalOpen])


    React.useEffect(() => {
        if (dayClicked) {
            const newDate = new Date(dayClicked)
            if (dayClicked.indexOf('T') === -1) {
                newDate.setDate(newDate.getDate() + 1)
            }
            setSelectedDate(newDate)
        }
    }, []);


    // Get Current Entry and User Tags
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

    const timezoneFix = (date: Date) => {
        const newDate = date;
        const offset = newDate.getTimezoneOffset() / 60;
        const hours = newDate.getHours();
        newDate.setHours(hours - offset);
        return newDate
    }


    //temporary img ids to create ImageStores with
    const tempImgId = (imgStoreIds?: number[]): number => {
        //might not need this? 
        const tempId = Math.floor(Math.random() * (99999 - 9999 + 1) + 9999);
        if (imgStoreIds) {
            if (imgStoreIds.includes(tempId))
                return tempImgId(imgStoreIds)
            else return tempId
        }
        else return tempId
    }

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
            if (id === newJournal.primaryTagId) {

                setNewJournal({ ...newJournal, primaryTagId: undefined })
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

    const getDateString = () => {

        return new Date(selectedDate).toLocaleDateString(undefined, dateOptions)
    }

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

    const getEndDateTime = (date: Date) => {
        const endTime = date
        endTime.setSeconds(endTime.getSeconds() + 60)
        return endTime
    }
    const handleTagClicked = (id: number) => {
        if (id)
            setPrimaryTag(id)
        setNewJournal({ ...newJournal, primaryTagId: id })
    }

    function handleExpand() {
        willExpand = true;
    }


    //methods related to upload
    const handleDeleteFile = (fileId: number) => {
        //remove the image from images to upload
        const newImages: ImageStore[] = imagesToUpload.filter(image => image.id !== fileId)
        setImagesToUpload(newImages);
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

    const handleDateChange = (date: MaterialUiPickersDate, value?: string | null | undefined) => {
        if (date)
            setSelectedDate(date)
    }
    const toggleDateTimeEdit = () => {
        if (dateDisplayStatus.display === 'none')
            setDateDisplayStatus({ display: 'block' })
        else
            setDateDisplayStatus({ display: 'none' })
    }

    const handleChange = (name: keyof Entry) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (name == 'startDateTime') {
            const endTime = new Date(event.target.value + 'Z')
            endTime.setSeconds(endTime.getSeconds() + 10);
            const endTimeString = endTime.toISOString().split('.')[0]
            setNewJournal({ ...newJournal, [name]: event.target.value, endDateTime: endTimeString });
        }
        else {
            setNewJournal({ ...newJournal, [name]: event.target.value });
        }
    };

    const handleSubmit = async (values: typeof initialValues) => {
        const imgIds = await imageStoreSubmit(imagesToUpload)
        createEntry({
            ...newJournal,
            imageStoreIds: imgIds,
            tagIds: getIdsFromArray(entryTags),
            startDateTime: timezoneFix(selectedDate).toISOString(),
            endDateTime: timezoneFix(getEndDateTime(selectedDate)).toISOString()
        }).then(res => {
            setNewJournal(res.data);
            if (res.data.id)
                addUserEntry(userId, res.data.id).then(() => {
                    props.handleModalClose();
                });
            if (willExpand) {
                // console.log('will expand');
                history.push(`/journal/edit/${res.data.id}`);
            }
            if(updateCalendar){ //update the year calendar
                updateCalendar(res.data); 
            }
            eventToCalEvent(res.data).then(calRes => {
                if (props.setFilteredEntries && props.filteredEntries) {
                    props.setFilteredEntries([...props.filteredEntries, calRes])
                }
            })
        });
    }
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            <BForm>
                <Card style={{ minWidth: '800px', minHeight: '500px' }} className='create-journal-modal'>
                    <CardContent>
                        <Grid container>
                            <Grid item xs={11}>
                                <InputBase
                                    name="title"
                                    placeholder="Add Journal Title"
                                    required
                                    value={newJournal.title}
                                    margin="dense"
                                    onChange={handleChange('title')}
                                    id='title'
                                    fullWidth
                                    autoFocus
                                    ref={titleInputRef}
                                    className='input-base'
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <Tooltip title='Go to Full Edit Page'>
                                    <IconButton
                                        aria-label='expand'
                                        onClick={handleExpand}
                                        type='submit'>
                                        <FullscreenOutlinedIcon fontSize='large' />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={6}>
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
                            <Grid container>
                                <Grid item xs={8}>
                                    <Typography
                                        variant="subtitle1"
                                        component="h2"
                                        className='description-typography'
                                    >
                                        Description
                                    </Typography>
                                    <TextField
                                        name='description'
                                        placeholder='Start writing here...'
                                        required
                                        multiline
                                        fullWidth
                                        rows={24}
                                        onChange={handleChange('description')}
                                        defaultValue={initialValues.description}
                                        InputProps={{ disableUnderline: true }}
                                        className='description-textfield'
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        name="location"
                                        placeholder='Add Location'
                                        onChange={handleChange('location')}
                                        InputProps={{
                                            startAdornment: (
                                                <LocationOnIcon />
                                            ),
                                        }}
                                        className='location-textfield'
                                    />
                                    <div className='side-component'>
                                        <EntryTagChips
                                            clickedPrimary={handleTagClicked}
                                            primaryTag={primaryTag}
                                            userTags={userTags}
                                            entryTags={entryTags}
                                            addTag={addTag}
                                            addTagToUser={addTagToUser}
                                            deleteTag={deleteTag} 
                                        />
                                    </div>
                                    <div className='side-component'>
                                        <AttachmentList 
                                            isJournal 
                                            files={imagesToUpload} 
                                            onDelete={handleDeleteFile} 
                                            onUpload={handleUpload} 
                                            truncateFileName
                                        />
                                    </div>
                                    <Grid container spacing={8} style={{marginTop: '250px'}}>
                                        <Grid item xs={6}>
                                            <Button
                                                id='journal-buttons'
                                                variant='contained'
                                                aria-label='cancel'
                                                onClick={handleModalClose}
                                                className='action-buttons'
                                            >
                                                Cancel
                                            </Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button
                                                variant='contained'
                                                color='primary'
                                                aria-label='create'
                                                type='submit'
                                                className='action-buttons'
                                            >
                                                Create
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </BForm>
        </Formik>
    );
};

export default CreateJournalModal;