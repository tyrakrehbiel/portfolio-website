import { Box, Button, Card, CardActions, CardContent, Chip, Popper, TextField, InputBase, Divider, Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Formik, FormikHelpers } from 'formik';
import { BDatePicker, BForm, BRadioGroup, BSelect, BSwitch, BTextField } from 'mui-bueno';
import React, { FunctionComponent } from 'react';
import { CalendarEntry, Entry, EntryField, ImageStore, Recurrence, Tag } from '../../@types';
import { addAttendee } from '../../axios/attendee';
import { createEntry, updateEntry } from '../../axios/entries';
import { createImageStore } from '../../axios/imageStores';
import { createRecurrence } from '../../axios/recurrence';
import { addUserTag, getUserTags } from '../../axios/user';
import { eventToCalEvent } from '../../common/calendar-utils/CalendarUtils';
import AttachmentCard from '../attachment-card/AttachmentCard';
import AttachmentList from '../attachment-card/AttachmentList';
import DateTimePickers from '../date-time-pickers/DateTimePickers';
import EntryTagChips from '../entry-tag-chips/EntryTagChips';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { convertUTCDateToLocalDate, daysOfWeek, ending, frequency, TIMES, validationValues } from './utils';
import './_CreateEventModal.scss';
import { useAppSelector } from '../../store/hooks';



interface CreateEventModalProps {
    userId: number;
    addEntry: (entryId: number) => Promise<any>;
    handleModalClose: () => void;
    modalOpen: boolean;
    setFilteredEntries?: React.Dispatch<React.SetStateAction<CalendarEntry[]>>;
    filteredEntries?: CalendarEntry[]
    updateCalendar?: (entry: Entry) => void; //this will update the year calendar
}

//This is styling stuff which should eventually be mved into scss file
const useStylesPopper = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            border: '1px solid',
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export const CreateEventModal: FunctionComponent<CreateEventModalProps> = (props) => {
    //Prop deconstruction
    const { userId, addEntry, handleModalClose, modalOpen, setFilteredEntries, filteredEntries } = props;
    //States
    const [showWeeks, setShowWeeks] = React.useState<boolean>(false);
    const [showEndDate, setShowEndDate] = React.useState<boolean>(false);
    const [everyType, setEveryType] = React.useState<string>(TIMES.DAY);
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [imagesToUpload, setImagesToUpload] = React.useState<ImageStore[]>([]);
    const [entry, setEntry] = React.useState<Entry>({
        id: undefined,
        title: '',
        recurrenceId: undefined,
        entryType: 'Event',
        startDateTime: '2021-06-22T07:30:00',
        endDateTime: '2021-06-22T10:30:00',
        description: '',
        location: '',
        fieldList: '',
        tagIds: [],
        imageStoreIds: [],
        primaryTagId: undefined,
    })
    const [emails, setEmails] = React.useState<string[]>([]);
    const [errorEmail, setErrorEmail] = React.useState<string>('');
    const [valueEmail, setValueEmail] = React.useState<string>('');
    const [errors, setErrors] = React.useState<any>({});
    const [fields, setFields] = React.useState<EntryField[]>([]);
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);
    const [primaryTag, setPrimaryTag] = React.useState(0)
    const [dateError, setDateError] = React.useState<boolean>(false);
    const updateCalendar = props.updateCalendar;

    let dayClicked = new Date(useAppSelector(store => store.selectedDate.date));
    dayClicked = new Date(dayClicked.getFullYear(), dayClicked.getMonth(), dayClicked.getDate() + 1, 
        new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()); //adjust date

    const [start, setStart] = React.useState<string>(convertUTCDateToLocalDate(dayClicked).toISOString().slice(0, 19));
    const [end, setEnd] = React.useState<string>(convertUTCDateToLocalDate(dayClicked).toISOString().slice(0, 19));
    const titleInputRef = React.useRef<HTMLInputElement>(null)

    //Vars
    const popperOpen = Boolean(anchorEl);
    const popperId = popperOpen ? 'simple-popper' : undefined;

    //useStyles
    const classesPopper = useStylesPopper();

    //useEffects
    React.useEffect(() => {
        getUserTags(userId).then(res => {
            setTags(res.data);
        })

    }, []);

    React.useEffect(() => {
        setEntryTags(tags.filter(tag => {
            if (tag.id)
                return entry.tagIds.includes(tag.id)
        }))
    }, [tags]);

    React.useEffect(() => {
        if (titleInputRef.current !== null) {
            titleInputRef.current.focus()
        }
    }, [modalOpen])

    React.useEffect(() => {
        if (entry.fieldList) {
            setFields(JSON.parse(entry.fieldList));
        }
        else {
            setFields([]);
        }
    }, []);

    //  Functions
    /**
     * This function creates the tag in the backend,
     *  reloads the userTag array from the backend and sets the state hook
     * @param tagId tag Id of the tag to be added to the user for the QuickCreateTag component
     */
    const addTagToUser = async (tagId: number) => {
        await addUserTag(Number(userId), tagId)
        const tagResponse = await getUserTags(Number(userId))
        setTags(tagResponse.data)
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

    const readAsBytes = async (file: File) => {
        const fileByteArray = [] as number[]
        const buffer = await file.arrayBuffer();
        const readFile = new Uint8Array(buffer)
        for (let i = 0; i < readFile.length; i++) {
            fileByteArray.push(readFile[i]);
        }
        return fileByteArray
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
        imagesToUpload.forEach(image => toUploadIds.push(image.id!));
        if (entry.imageStoreIds.includes(tempId) || toUploadIds.includes(tempId))
            return tempImgId();
        else return tempId;
    }

    const handleTypeChange = (event: React.ChangeEvent<{ name?: string, value: any }>, value: any) => {
        switch (value) {
        case TIMES.DAILY:
            setEveryType(TIMES.DAY);
            setShowWeeks(false);
            break;
        case TIMES.WEEKLY:
            setEveryType(TIMES.WEEK);
            setShowWeeks(true);
            break;
        case TIMES.MONTHLY:
            setEveryType(TIMES.MONTH);
            setShowWeeks(true);
            break;
        case TIMES.YEARLY:
            setEveryType(TIMES.YEAR);
            setShowWeeks(false);
            break;
        }
    }

    // This handleChange deals with basic updates
    const handleChange = (name: keyof Entry) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntry({ ...entry, [name]: event.target.value });
    }

    //part of the recurrence fields
    const handleRadioChange = (event: any) => {
        setShowEndDate(event.target.value === 'On');
    }

    // Reoccurrence handler
    const handleReocurrClick = (event: React.MouseEvent<HTMLElement>) => {
        const oldRecurr = entry.recurr;
        setEntry({ ...entry, recurr: !oldRecurr });
        //This part toggles the anchor of the recurr popper so that it appears or dissapperars appropriately
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };


    const handleTagClicked = (id: number) => {
        setEntry({ ...entry, primaryTagId: id })
        setPrimaryTag(id)
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



    // Handle start time change
    const handleStartTimeChange = (date: MaterialUiPickersDate) => {
        setDateError(false);
        if (date && date.toString() != 'Invalid Date') {
            setStart(date.toISOString().slice(0, 19));
            // Because end date should always adjust immediately after start date, we do not try 
            //to check if end is after start here
        }
    }

    // Handle end time Change
    const handleEndTimeChange = (date: MaterialUiPickersDate) => {
        setDateError(false);
        if (date && date.toString() != 'Invalid Date') {
            setEnd(date.toISOString().slice(0, 19));
            //end runs second and is capable of messing up, so we throw an error
            //here is start > our new end
            if (start > date.toISOString().slice(0, 19)) {
                setDateError(true);
                //console.log('t4 on')
            }
            else {
                setDateError(false);
                //console.log('t4 off')
            }
        }
    }

    const handleRemoveEmail = (name: string) => {
        return (event: any) => {
            setEmails(emails.filter(e => e !== name))
        };
    };

    const handleAddTag = (id: number | undefined) => {
        if (id) {
            const newTag = tags.find(tag => tag.id == id) // Using the tagId, gets the tag object from userTags
            if (newTag) {
                const nonExist = entryTags.find(tag => tag.id == newTag.id) // if the tag is already in entryTags[], don't add it
                if (nonExist === undefined) {
                    setEntryTags([...entryTags, newTag])
                    if (newTag.id) {
                        entry.tagIds.push(newTag.id)
                    }
                }
            }
        }
    }
    const handleSubmit = async (vals: typeof validationValues, { setStatus }: FormikHelpers<typeof validationValues>) => {
        entry.tags = entryTags
        setErrors({});

        //set start and end
        entry.startDateTime = start
        entry.endDateTime = end

        //Attachments cont
        const idsToSubmit = await imageStoreSubmit(imagesToUpload)

        //creating entry and recurrence if needed
        //note idsToSubmit make it into creeateEntry
        createEntry({ ...entry, imageStoreIds: idsToSubmit }).then(res => {
            if (addEntry)
                addEntry(res.data.id!).then(() => {
                    setEntry(res.data);
                    setFields([]);
                    const entryId = Number(res.data.id);

                    // adding all attendees
                    emails.forEach(async e => {
                        const attendee = await addAttendee({
                            id: undefined,
                            email: e,
                            entryId: entryId,
                            response: 'SENT'
                        })
                    })

                    if (vals.recurr && res.data.id) {
                        const recurr: Recurrence = {
                            id: undefined,
                            entryId: entryId,
                            type: vals.recurrType,
                            every: vals.every,
                            endDate: '',
                            occurrence: ''
                        };
                        if (vals.ending === 'On') {
                            recurr.endDate = vals.endRecurr.toISOString().slice(0, 10) + 'T00:00:00'
                        }
                        if (vals.recurrType === TIMES.MONTHLY || vals.recurrType === TIMES.WEEKLY) {
                            recurr.occurrence = String(vals.weekSelect)
                        }
                        createRecurrence(recurr).then(res2 => {
                            if (entry.recurr && typeof res2.data.id != undefined) {
                                const recurrId = Number(res2.data.id);
                                entry.id = entryId;
                                entry.recurrenceId = recurrId;
                                updateEntry(entry)
                            }
                        });
                    }
                    
                    if(updateCalendar){ //update the year calendar
                        updateCalendar(res.data); 
                    }
                    eventToCalEvent(res.data).then(calRes => {
                        if (setFilteredEntries && filteredEntries) {
                            setFilteredEntries([...filteredEntries, calRes])
                        }
                    })
                });
        });
        handleModalClose();
    }

    //On keys
    const onKeyDownEmail = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateAddEmail(e.target.value)
        }
    }

    /**
     * on lose focus adds email to attendees list
     * @param e email to be added
     */
    const attendeeOnBlur = (e: any) => {
        e.preventDefault();
        if (e.target.value === ''){
            setErrorEmail('');
            return;
        }
        validateAddEmail(e.target.value)
    }

    /**
     * check if email format is valid
     * add it to list if valid
     * throw errors otherwise
     * @param data check if email format is valid
     * 
     */
    const validateAddEmail = (data: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // checking email format
        if (re.test(String(data).toLowerCase())) {

            // checking if email has already been added
            if (!emails.find(e => e === data)) {
                setEmails([...emails, data])
                setErrorEmail('')
                setValueEmail('')

            }
            else {
                setErrorEmail('Email already added')
            }
        } else {
            setErrorEmail('Email invalid')
        }
    }

    //Mui bueno form validation
    const validate = (values: any): { [k: string]: string } => {

        const errors: { [k: string]: string } = {};
        if (values.title === '') {
            errors.title = 'Title cannot be empty';
        }
        if (values.entryType === '') {
            errors.confirmPassword = 'Entry Type required';
        }
        if (values.startDateTime === '') {
            errors.startDateTime = 'Start Date-Time cannot be empty';
        }
        if (values.endDateTime === '') {
            errors.endDateTime = 'End Date-Time cannot be empty';
        }
        if (entry.startDateTime > entry.endDateTime) {
            errors.start = 'End Date cannot be before Start Date'
            // this error is not actually visible
            //however it is still important because it sets the dateError flag
            //and also prevents submission from occurring until error is fixed
        }

        if (values.recurr) {
            if (values.recurrType === '') {
                errors.recurrType = 'Must select a recurrence type';
            }
            if (values.every <= 0) {
                errors.every = 'Frequency must be positive';
            }
            if (values.weekSelect.length === 0 &&
                (values.recurrType === TIMES.WEEKLY || values.recurrType === TIMES.MONTHLY)) {
                errors.weekSelect = 'Please select at least one day';
            }
            if (values.ending === 'On' && values.endRecurr === '') {
                errors.endRecurr = 'Please select when to stop recurring';
            }
        }
        return errors;
    }

    return (
        <Formik
            initialValues={validationValues}
            onSubmit={handleSubmit}
            validate={validate}
            validateOnChange={false}
            validateOnBlur={true}
        >
            <BForm>
                <Card>
                    <CardContent>
                        <div className="outer-container">
                            <Grid container >
                                <Grid container>
                                    <Grid item xs={8}>
                                        <BTextField
                                            name="title"
                                            placeholder="Add Event Title"
                                            required
                                            margin="dense"
                                            onChange={handleChange('title')}
                                            className='input-base'
                                            variant='standard'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box className='recurrence-container'>
                                            <BSwitch name="recurr" label="Recurring?" onClick={handleReocurrClick}
                                                labelPlacement='start' />
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Box className='tag-chips-container'>
                                    <EntryTagChips
                                        primaryTag={entry.primaryTagId}
                                        clickedPrimary={handleTagClicked}
                                        userTags={tags} entryTags={entryTags}
                                        addTag={handleAddTag} addTagToUser={addTagToUser} deleteTag={deleteTag} 
                                    />
                                </Box>
                                <Box className='date-container'>
                                    <DateTimePickers onChange={handleStartTimeChange} defaultDate={dayClicked}
                                        labelDate='Start Date' labelTime='Start Time' dateError={dateError} />

                                    <DateTimePickers onChange={handleEndTimeChange}
                                        labelDate='End Date' labelTime='End Time' dateError={dateError}
                                        spaceFrom={start}
                                    />
                                </Box>
                                <div>
                                    <Popper id={popperId} open={popperOpen} anchorEl={anchorEl} style={{ zIndex: 1200 }} placement='right-start' >
                                        <div className={classesPopper.paper}>

                                            {TIMES.REPEAT}
                                            <BTextField
                                                name={'every'}
                                                label={''}
                                                inputProps={{ type: 'number' }}
                                                onChange={handleChange('every')}
                                                variant='standard'
                                            />
                                            <BSelect
                                                name={'recurrType'}
                                                label={''}
                                                options={frequency}
                                                placeholder={'Select Type'}
                                                onChange={handleTypeChange}
                                            />

                                            {showWeeks && TIMES.ON}
                                            {showWeeks &&
                                                    <BSelect
                                                        name={'weekSelect'}
                                                        label={''}
                                                        options={daysOfWeek}
                                                        multiple
                                                        placeholder={'Select Days To Repeat'}
                                                        renderValue={selected => (
                                                            <div>
                                                                {(selected as number[]).map(value => {
                                                                    const chip = daysOfWeek[value];
                                                                    return (
                                                                        chip &&
                                                                        <Chip
                                                                            key={`tag-${chip.value}`}
                                                                            label={chip.label}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    />}

                                            {everyType && TIMES.ENDS}
                                            <BRadioGroup
                                                name='ending'
                                                radios={ending}
                                                label=''
                                                onChange={handleRadioChange}
                                            />
                                            {showEndDate &&
                                                    <BDatePicker
                                                        name={'endDate'}
                                                    />
                                            }
                                        </div>
                                    </Popper>
                                </div>
                                
                                <Grid item xs={11}>
                                    <BTextField 
                                        name="description" 
                                        placeholder={'Add Description'}
                                        margin="dense"
                                        onChange={handleChange('description')}
                                        className='input-base'
                                        variant='standard'
                                    />
                                </Grid>
                                <Grid item xs={10}>
                                    <TextField
                                        name='email'
                                        fullWidth
                                        onKeyDown={onKeyDownEmail}
                                        error={!!errorEmail}
                                        helperText={errorEmail}
                                        placeholder={'Attendees'}
                                        onBlur={attendeeOnBlur}
                                        value={valueEmail}
                                        onChange={(e) => { setValueEmail(e.target.value) }}
                                        variant='standard'
                                        className='attendee-textfield'
                                    />
                                </Grid>
                                <Grid container justifyContent='flex-start'>
                                    {
                                        emails.map(value => {
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    onDelete={handleRemoveEmail(value)}
                                                />
                                            );
                                        })
                                    }
                                </Grid>
                                <Grid item xs={11}>
                                    <BTextField
                                        name="location"
                                        placeholder="Add Location"
                                        margin="dense"
                                        onChange={handleChange('location')}
                                        className='input-base'
                                        variant='standard'
                                        InputProps={{
                                            startAdornment: (
                                                <LocationOnIcon />
                                            ),
                                        }}
                                    />
                                </Grid>
                                {/* <InputBase name="location" placeholder={'Add Location'}
                                    onChange={()=>handleChange('location')} /> */}
                                <Box className='attachment-list'>
                                    <AttachmentList 
                                        isJournal 
                                        files={imagesToUpload} 
                                        onDelete={handleDeleteFile} 
                                        onUpload={handleUpload} 
                                        truncateFileName
                                    />
                                </Box>
                            </Grid>
                        </div>
                    </CardContent>
                    <CardActions className={'space-between'}>
                        <Grid container>
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
                    </CardActions>
                </Card>
            </BForm>
        </Formik>
    );
};
