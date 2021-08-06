import * as React from 'react';
import { TextField, Card, CardContent, Typography, Modal, Button, Popper, Chip, InputBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid} from '@material-ui/core';
import { createStyles, makeStyles, Theme} from '@material-ui/core/styles';
//import * as yup from 'yup';
import { useHistory, useParams } from 'react-router-dom';
import { BForm, BButton, BSubmit, BOption, BRadio, BSelect, BTextField, BRadioGroup} from 'mui-bueno';
import { Formik } from 'formik';
import { Entry, EntryField, Recurrence, Tag, ImageStore } from '../../../src/@types';
import { getEntryById, updateEntry, deleteEntry, belongsToMe } from '../../axios/entries';
import {createRecurrence, updateRecurrence, deleteRecurrence, getRecurrenceById} from '../../axios/recurrence';
import { addUserTag,getUserTags } from '../../axios/user';
import { getImageById, deleteImageStoreById, createImageStore } from '../../axios/imageStores';

import AttachmentCard from '../attachment-card/AttachmentCard';
import EntryTagChips from '../entry-tag-chips/EntryTagChips';
import EventFields from './EventFields';
import { AttendeeEdit } from './AttendeeEdit';
import './_FullEvent.scss';
import DeleteIcon from '@material-ui/icons/Delete';
import { useAppSelector } from '../../store/hooks';
import EditErrorBar from '../../common/snackbars/EditErrorBar';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DateTimePickers from '../date-time-pickers/DateTimePickers';
//import { startOfDay } from '@fullcalendar/common';

interface RouteParams {
    eventId?: string;
}

const TIMES = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
    DAY: 'day(s)',
    WEEK: 'week(s)',
    MONTH: 'month(s)',
    YEAR: 'year(s)',
    SUNDAY: 'Sunday',
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    REPEAT: 'Repeat Every',
    ON: 'On',
    ENDS: 'Ends'
}

const useStylesPopper = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            border: '1px solid',
            padding: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
        },
        typography: {
            padding: theme.spacing(1),
        },
        button: {
            margin: theme.spacing(1),
            backgroundColor: '#D65F5F',
        },
    }),
);

let startDate = '';
let startTime = '';
let endDate = '';
let endTime = '';
let dateSet = false;
let recurChange = false;
let recurFetched = false;
let recurDisplay = ['| Repeats Every ', '', '', '', ', Ends ', ''];

const FullEvent: React.FC = () => {

    const { eventId } = useParams<RouteParams>();
    const userId = useAppSelector(store => store.user.user.id);
    const [fields, setFields] = React.useState<EntryField[]>([]);
    const [emailSubmit, setEmailSubmit] = React.useState(false);
    const history = useHistory();
    const goBack = () => { history.goBack() };
    //const [errors, setErrors] = React.useState<any>({});
    const [deleteDialog, setDeleteDialog] = React.useState(false); // Dictates whether delete dialog should be open or not
    const [event, setEvent] = React.useState<Entry>({
        id: undefined,
        title: '',
        recurrenceId: undefined,
        entryType: '',
        startDateTime: '',
        endDateTime: '',
        endDate: '',
        description: '',
        location: '',
        fieldList: '',
        fields: '',
        tagIds: [],
        imageStoreIds: [],
        recurr: false,
        recurrType: '', 
        every: 1,
        endRecurr: new Date(),
        weekSelect: [],
        ending:'',
        primaryTagId: undefined,
    });


    // Misc
    const [dataFetched, setDataFetched] = React.useState<boolean>(false);


    // For Attachment Card
    const [images, setImages] = React.useState<ImageStore[]>([]);
    const [imagesToUpload, setImagesToUpload] = React.useState<ImageStore[]>([]);
    const [imageIdsToDelete, setImageIdsToDelete] = React.useState<number[]>([]);

    // For Date Time Pickers
    const [dateError, setDateError] = React.useState<boolean>(false);

    //recurrence setup
    const [showWeeks, setShowWeeks] = React.useState<boolean>(false);
    const [showEndDate, setShowEndDate] = React.useState<boolean>(false);
    const [everyType, setEveryType] = React.useState<string>(TIMES.DAY);

    // edit permissions
    const [editPermission, setEditPermission] = React.useState(false);
    const [showEditErrorBar, setShowEditErrorBar] = React.useState(false);

    const frequency: BOption<string>[] = [
        { value: TIMES.DAILY, label: TIMES.DAY },
        { value: TIMES.WEEKLY, label: TIMES.WEEK },
        { value: TIMES.MONTHLY, label: TIMES.MONTH },
        { value: TIMES.YEARLY, label: TIMES.YEAR }];

    const daysOfWeek: BOption<string>[] = [
        { value: '0', label: TIMES.SUNDAY },
        { value: '1', label: TIMES.MONDAY },
        { value: '2', label: TIMES.TUESDAY },
        { value: '3', label: TIMES.WEDNESDAY },
        { value: '4', label: TIMES.THURSDAY },
        { value: '5', label: TIMES.FRIDAY },
        { value: '6', label: TIMES.SATURDAY }];
        
    const ending: BRadio<string>[] = [
        {label: 'Never', value: 'Never'},
        {label: 'On', value: 'On'}];

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

    //for recurrence popper
    const classesPopper = useStylesPopper();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const popperOpen = Boolean(anchorEl);
    const popperId = popperOpen ? 'simple-popper' : undefined;

    const handleRecurrClick = (eventt: React.MouseEvent<HTMLElement>) => {
        recurChange = true;
        const oldRecurr = event.recurr;
        setEvent({ ...event, recurr: !oldRecurr });
        //this will open and close recurrence dialog
        setAnchorEl(anchorEl ? null : eventt.currentTarget);
    };

    const handleRadioChange = (event: any) => {
        setShowEndDate(event.target.value === 'On');
    }

    React.useEffect(() => {
        if (eventId && isNaN(Number(eventId))){
            history.push('/event-not-found')
        }
        getEntryById(Number(eventId))
            .then(res => {
                setEvent(res.data); 
                if (res.data.fields && res.data.fields.length > 3) {
                    event.fields = res.data.fields;
                    setFields(JSON.parse(res.data.fields));
                }
                setDataFetched(true);
                // check ownership
                if (res.data.id && userId) {
                    belongsToMe(userId, res.data.id).then((res) => {
                        setEditPermission(res.data);
                        setShowEditErrorBar(!res.data);
                    })
                }
            })
            .catch(err => {
                history.push('/event-not-found')
            })
    }, [])


    // Formats time from 24 to am/pm
    const formatTime = (time: string) => {
        let hr = Number(time.substring(0,2)); 
        if (hr > 12){
            hr -= 12;
            time = String(hr) + time.substring(2,6) + 'pm';
        }else{
            if (time.substring(0,1) === '0') time = time.substring(1);
            if (time.substring(0,1) === '0') time = '12' + time.substring(1);
            time = time + 'am';
        }
        return time;
    }


    // Converts LocalDateTime to Date for displaying
    const setDateTime = () => {
        let date = new Date(event.startDateTime).toDateString()
        startDate = date;
        startTime = formatTime(event.startDateTime.substring(11,16));

        date = new Date(event.endDateTime).toDateString()
        if (startDate !== date) endDate = date;
        else endDate = '';
        endTime = formatTime(event.endDateTime.substring(11,16));
    }


    // Sets the date and recurrence data on the page once it is fetched from the backend
    React.useEffect(() => {
        // Sets the date and recurrence data on the page once it is fetched from the backend
        if (event.startDateTime !== ''){
            setDateTime();
            dateSet = true;
            if (event.recurrenceId) {
                getRecurrenceById(Number(event.recurrenceId)).then(res => {
                    event.every = res.data.every;
                    event.type = res.data.type;
                    event.weekSelect = res.data.occurrence;
                    recurFetched = true;

                    if (res.data.every !== 1) recurDisplay[1] = res.data.every;
                    recurDisplay[2] = ' ' + res.data.type.substring(0,res.data.type.length - 2);
                    if (res.data.type === 'Daily') recurDisplay[2] = ' Day';
                    if (res.data.every !== 1) recurDisplay[2] = recurDisplay[2].concat('s');
                    if (res.data.occurrence !== '-1' && res.data.occurrence !== ''){
                        recurDisplay[3] = ' On'
                        const dayList = event.weekSelect.split(',').sort();
                        for (let day = 0; day < event.weekSelect.length; day++){
                            switch (dayList[day]) {
                            case '0': 
                                recurDisplay[3] = recurDisplay[3].concat(' Su');
                                break;
                            case '1': 
                                recurDisplay[3] = recurDisplay[3].concat(' Mo');
                                break;
                            case '2': 
                                recurDisplay[3] = recurDisplay[3].concat(' Tu');
                                break;
                            case '3': 
                                recurDisplay[3] = recurDisplay[3].concat(' We');
                                break;
                            case '4': 
                                recurDisplay[3] = recurDisplay[3].concat(' Th');
                                break;
                            case '5': 
                                recurDisplay[3] = recurDisplay[3].concat(' Fr');
                                break;
                            case '6': 
                                recurDisplay[3] = recurDisplay[3].concat(' Sa');
                            }
                        }
                    }
                    const d = new Date(res.data.endDate.substring(5,7) + '/' 
                        + res.data.endDate.substring(8,10) + '/' 
                        + res.data.endDate.substring(0,5));
                    recurDisplay[5] = d.toDateString();
                    if (res.data.endDate.substring(0,4) === '2050') recurDisplay[5] = 'Never';
                    setEvent({ ...event, recurr: event.recurr });
                })  
            } else {
                recurDisplay = ['| Add Recurrence'];
                recurFetched = true;
            }
        }

    }, [dataFetched]);

    //TAGS

    //Setting up tag selector UI:
    const [userTags, setUserTags] = React.useState<Tag[]>([]);
    const [entryTags, setEntryTags] = React.useState<Tag[]>([]);
    const [primaryTag, setPrimaryTag] = React.useState<number > (0)

    React.useEffect(()=>{
        //Get User's Tags
        (async () => {
            //console.log('trying to get user id' + userId)
            if(userId!==null && userId){ 
                const response = await getUserTags(userId)
                //console.log(response.data)
                setUserTags(response.data)}
        })()
    },[userId])
    //Tagging Hook 
    /**
     * This function compares the entry.tagIds array and the userTags array 
     * and populates the entryTags array 
     */
    React.useEffect(() => {
        if(userTags.length > 0){
            //console.log('populating tags with '+event.tagIds)
            setEntryTags(userTags.filter(tag => {
                if(tag.id)
                    return event.tagIds.includes(tag.id)
            }))
        }
    }, [userTags,event.tagIds]);

    // Tagging Functions
    /**
     * This function creates the tag in the backend,
     *  reloads the userTag array from the backend and sets the state hook
     * @param tagId tag Id of the tag to be added to the user for the QuickCreateTag component
     */
    const addTagToUser = async (tagId: number) => {
        if (userId) {
            await addUserTag(Number(userId), tagId)
            const tagResponse =  await getUserTags(Number(userId))
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
            event.tagIds = event.tagIds.filter(tag => tag !== id)
            if(id === event.primaryTagId){

                setEvent({ ...event, primaryTagId: undefined })
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
            const newTag = userTags.find(tag => tag.id == id)
            if (newTag) {
                const nonExist = entryTags.find(tag => tag.id == newTag.id)
                if (nonExist === undefined) {
                    setEntryTags([...entryTags, newTag])
                    event.tagIds.push(id);
                }
            }
        }
    }
    /**
     * 
     * @param id id of the tag that has been clicked to make it the primary tag for this entry
     */
    const handleTagClicked = (id: number) =>{
        setEvent({...event, primaryTagId:id})
        setPrimaryTag(id)
    }
    /**
     * Make sure the primaryTagId property is set properly
     */
    const validatePrimaryTag = () =>{
        // if no tags, primary tag is undefined
        if(entryTags.length === 0){
            setEvent({...event, primaryTagId:undefined})
        }
        // if tags but primary tag isn't set, the event doesn't have a primary Id already, set to first of tag list
        if(entryTags.length > 0 && primaryTag === 0 ){
            if(event.primaryTagId === undefined || event.primaryTagId === null ){
                setEvent({...event, primaryTagId:event.tagIds[0]})
            }
        }
        // if primary tag isn't 0, the primary tag has changed, set it to that value
        if(entryTags.length > 0 && primaryTag !== 0){
            setEvent({...event, primaryTagId:primaryTag})
        }
        // else don't need to do anything because the event has a primary tag and it hasn't changed

    }


    React.useEffect(() => {
        (async () => {
            const imgs: ImageStore[] = []
            await Promise.all(event.imageStoreIds.map(async (imageId) => {
                const image = await getImageById(imageId)
                imgs.push(image.data)
            }))
            setImages(imgs)
        })()

    }, [event.imageStoreIds]);

    // Handle start time change
    const handleStartTimeChange = (date: MaterialUiPickersDate) => {
        setDateError(false);
        if (date && date.toString() != 'Invalid Date') {
            setEvent({ ...event, startDateTime: date.toISOString().slice(0, 19)});
            // Because end date should always adjust immediately after start date, we do not try 
            //to check if end is after start here
        }
    }

    // Handle end time Change
    const handleEndTimeChange = (date: MaterialUiPickersDate) => {
        setDateError(false);
        if (date && date.toString() != 'Invalid Date') {
            setEvent({ ...event, endDateTime: date.toISOString().slice(0, 19)});
            //end runs second and is capable of messing up, so we throw an error
            //here is start > our new end
            if (event.startDateTime > date.toISOString().slice(0, 19)) {
                setDateError(true);
                //console.log('t4 on')
            }
            else {
                setDateError(false);
                //console.log('t4 off')
            }
            
        }
    }

    const handleSubmit = async (change: any) => {

        if (!editPermission) {
            setShowEditErrorBar(true);
            return;
        }

        const filteredIds = event.imageStoreIds.filter(id=>{
            // if included in ToDelete, filter it out, else keep it
            return (imageIdsToDelete.includes(id)? false : true)
        })
        const newIds = await imageStoreSubmit(imagesToUpload)
        const idsToSubmit = filteredIds.concat(newIds)

        validatePrimaryTag()
        setEmailSubmit(true)

        if (recurChange){
            if ( change.recurrType !== '' && change.every > 0 &&   
                ( (change.recurrType === 'Daily' || change.recurrType === 'Yearly') ||
                ( (change.recurrType === 'Weekly' || change.recurrType === 'Monthly') && change.weekSelect.length !== 0) ) &&
                ( change.ending === 'Never' || (change.ending === 'On' && event.endDate !== undefined && 
                event.endDate !== '' && event.endDate.substring(0,4) !== '2050' && event.endDate.length < 18) ) ) {
                const recur:Recurrence = {
                    id: undefined, 
                    entryId: Number(eventId), 
                    type: change.recurrType,
                    every: change.every,
                    endDate: '2050-01-01T00:00:00',
                    occurrence:'-1'};
                if (change.ending === 'On'){
                    recur.endDate = event.endDate + 'T00:00:00';
                }
                if (recur.type === TIMES.MONTHLY || recur.type === TIMES.WEEKLY) {
                    recur.occurrence = String(change.weekSelect);
                }
                if (event.recurrenceId) {
                    recur.id = event.recurrenceId;
                    if (!(recur.type === event.type && recur.every === event.every 
                        && recur.endDate === event.endDate && recur.occurrence === event.weekSelect)){
                        updateRecurrence(recur).then(res => {
                            updateEntry(event).then(res2 => {
                                setEvent(res2.data);
                                history.goBack();
                            }); 
                        });
                    }
                }else {
                    createRecurrence(recur).then(res => {
                        event.recurrenceId = res.data.id;
                        updateEntry({...event, imageStoreIds:idsToSubmit}).then(res2 => {
                            setEvent(res2.data);
                            history.goBack();
                        }); 
                    });
                }
            } 
        } else {
            const newEntry = await updateEntry({...event, imageStoreIds:idsToSubmit})
            await setEvent(newEntry.data)
            history.goBack();
        } 

        //first deleting any imageStores which need to be deleted
        Promise.all(imageIdsToDelete.map(async (imageId)=>{
            const id = Number(imageId);
            const response = await deleteImageStoreById(id);
        }))
    }
    

    const handleChange = (name: keyof Entry) => (change: React.ChangeEvent<HTMLInputElement>) => {
        setEvent({ ...event, [name]: change.target.value });
        if (name === 'startDateTime') {
            event.startDateTime = change.target.value;
            setDateTime();
            
        } else if (name === 'endDateTime'){
            event.endDateTime = change.target.value;
            setDateTime();
        } 
    }

    // Edit date dropdown
    function toggleDateTimeEdit() {
        //setEvent({ ...event, startDate: event.startDate});
        const x = document.getElementById('date-time-edit');
        if (x !== null){
            if (x.style.display === 'none') {
                x.style.display = 'block';
            } else if (x.style.display === 'block'){
                x.style.display = 'none'
            } else {
                x.style.display = 'block';
            }
        }
    }

    // For Delete Event and Recurrence 
    const handleDeleteClick = (eventt: React.MouseEvent<HTMLElement>) => {
        if (event.recurrenceId) setDeleteDialog(true);
        else handleEventDelete();
    };

    const handleEventDelete = () => {

        if (!editPermission) {
            setShowEditErrorBar(true);
            return;
        }

        if (eventId){
            if (Number(eventId) > 1){
                for (let i = 0; i < event.imageStoreIds.length; i++) {
                    deleteImageStoreById(i);
                }
                deleteEntry(Number(eventId));
                history.goBack();
            }
        } 
    }

    const handleEventAndRecurDelete = () => {
        deleteRecurrence(Number(event.recurrenceId));
        handleEventDelete();
    }

    const handleDeleteDialogClose = () => { setDeleteDialog(false) };
    const handleClickFile = (name: keyof Entry) => (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('I am ' + name);
    }

    //functions for attachment card
    const handleDeleteFile = (fileId: number) => {

        //remove the image from images to upload
        const newImages : ImageStore[] = imagesToUpload.filter(image => image.id !== fileId)
        setImagesToUpload(newImages);

        //add the image id to image ids to delete
        const imagesDeleteQueue = images.filter(image=> image.id === fileId)
        const ids: number[] = imagesDeleteQueue.filter(image => image.id!== undefined).map(image=>Number(image.id))
        setImageIdsToDelete(imageIdsToDelete.concat(ids))

        //remove the image from images (if it was in the backend)
        setImages(images.filter(image => image.id !== fileId));
    };

    //temporary img ids to create ImageStores with
    const tempImgId = (): number => {
        //might not need this? 
        const tempId = Math.floor(Math.random() * (99999 - 9999 + 1) + 9999);
        const toUploadIds = [] as number[];
        imagesToUpload.map(image => toUploadIds.push(image.id!));
        if(event.imageStoreIds.includes(tempId) || toUploadIds.includes(tempId))
            return tempImgId();
        else return tempId;
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

    const imageStoreSubmit = async (files: ImageStore[]) =>{
        const newImgIds: number[] = []
        await Promise.all(files?.map(async (file)=>{
            const response = await createImageStore({
                id: undefined,
                filename: file.filename,
                image: file.image
            })
            if(response.data.id)
                newImgIds.push(response.data.id)
        }))
        return newImgIds
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

    const setFieldList = (fieldList: string) => {
        event.fields = fieldList;
        setFields(JSON.parse(fieldList));
    }
    /*4
    const validate = (values: any): Record<string, unknown> => {
        const errors: {[k: string]: string} = {};
        if (values.description === '') {
            errors.description = 'Description cannot be empty';
        }
        return errors;
    } */

    return (
        <React.Fragment>
            <div className='full-event-root'>
                <Formik
                    //enableReinitialize
                    initialValues={event}
                    onSubmit={handleSubmit}
                    //validate={validate}
                    //validationSchema={updateSchema}
                    //validateOnChange={false}
                >
                    <BForm>
                        <div className='grid'>
                            <BButton id='delete' onClick={handleDeleteClick}><DeleteIcon /></BButton>
                            <Dialog
                                open={deleteDialog}
                                onClose={handleDeleteDialogClose}
                            >
                                <DialogTitle id='alert-dialog-title'>{'Delete Entire Recurrence?'}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id='alert-dialog-description'>
                                        Do you want to delete just this event ({event.title}) or this event and the recurrence it belongs to?
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button id='cancel-del' onClick={handleDeleteDialogClose} color='primary'>
                                        Cancel
                                    </Button>
                                    <Button id='event-del' onClick={handleEventDelete} color='primary' autoFocus>
                                        Delete Event
                                    </Button>
                                    <Button id='recur-del' onClick={handleEventAndRecurDelete} color='primary'>
                                        Delete Recurrence
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <div className='header'>
                                <InputBase
                                    id='title'
                                    name='title'
                                    required
                                    value={event.title}
                                    onChange={handleChange('title')}
                                    autoComplete='off'
                                />
                                <div>
                                    <EntryTagChips clickedPrimary={handleTagClicked} primaryTag={event.primaryTagId} userTags={userTags} entryTags={entryTags} addTag={addTag} addTagToUser={addTagToUser} deleteTag={deleteTag} />
                                </div>
                                <div id='date-time-recurrence'>
                                    <BButton id='date' onClick={toggleDateTimeEdit}>{startDate + ' ' + startTime + ' - ' + endDate + ' ' + endTime}</BButton>
                                    {recurFetched &&
                                    <BButton id='recur' onClick={handleRecurrClick}>{recurDisplay}</BButton>
                                    }
                                    {recurFetched &&
                                    <div>
                                        <Popper id={popperId} open={popperOpen} anchorEl={anchorEl} style={{ zIndex: 1200 }} placement='bottom-start' >
                                            <div className={classesPopper.paper}>
                                                {TIMES.REPEAT} 
                                                <BTextField
                                                    name='every'
                                                    label={''}
                                                    inputProps={{ type: 'number' }}
                                                    onChange={handleChange('every')}
                                                />
                                                <BSelect
                                                    name={'recurrType'}
                                                    label={''}
                                                    options={frequency}
                                                    placeholder={'Select Type'}
                                                    onChange={handleTypeChange}
                                                />

                                                {showWeeks && TIMES.ON}
                                                {showWeeks  &&
                                                    <BSelect
                                                        name='weekSelect'
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
                                                { showEndDate && 
                                                    <TextField
                                                        id="date-time-select"
                                                        name='endDate'
                                                        label='End Recurrence'
                                                        type="date"
                                                        defaultValue={event.endDate}
                                                        onChange={handleChange('endDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                }

                                            </div>
                                        </Popper>
                                    </div>
                                    }
                                    {dataFetched &&
                                    <div id='date-time-edit' >

                                        <DateTimePickers onChange={handleStartTimeChange}
                                            labelDate='Start Date' labelTime='Start Time' dateError={dateError} 
                                            init={event.startDateTime} />

                                        <DateTimePickers onChange={handleEndTimeChange}
                                            labelDate='End Date' labelTime='End Time' dateError={dateError}
                                            init={event.endDateTime} spaceFrom={event.startDateTime} />
                                    </div>
                                    }
                                </div>
                            </div>
                            <Card className='description' elevation={5}>
                                <CardContent>
                                    <Typography className='title-card' variant="h6" component="h2">
                                    Description
                                    </Typography>
                                    <TextField
                                        name='description'
                                        multiline
                                        fullWidth
                                        rows={8}
                                        onChange={handleChange('description')}
                                        defaultValue={event.description}
                                    />
                                </CardContent>
                            </Card>
                            <AttachmentCard files={images.concat(imagesToUpload)} onDelete={handleDeleteFile} onUpload={handleUpload}/>
                            <AttendeeEdit entryId={Number(eventId) || undefined} submit={emailSubmit}/>    
                            <div className='field-grid'>
                                <EventFields fieldList={fields} numRows={7} setFieldString={setFieldList}/>
                            </div>
                            <div className='c-s-btns'>
                                <BButton id='cancel-btn' onClick={goBack}>Cancel</BButton>
                                <BSubmit id='save-btn' variant='contained' >Save</BSubmit>
                            </div>
                        </div>
                    </BForm>
                </Formik>
                <EditErrorBar open={showEditErrorBar} setShowEditErrorBar={setShowEditErrorBar}/>
            </div>
        </React.Fragment>
    );
};

export default FullEvent;

