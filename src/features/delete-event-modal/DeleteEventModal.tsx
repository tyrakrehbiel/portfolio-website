import { Button, FormLabel } from '@material-ui/core';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { useHistory } from 'react-router-dom';
import { deleteEntry } from '../../axios/entries';
import './_DeleteEventModal.scss';

interface DeleteEventModalProps {
    onCancel: () => void;
    eventId: number;
}

const DeleteEventModal: FunctionComponent<DeleteEventModalProps> = (props) => {
    const history = useHistory();
    const eventId = props.eventId;

    const onDelete = () => {
        //Add check to see if id exists in database
        if (eventId){
            if (eventId > 1){
                deleteEntry(eventId);
                history.goBack();
                
            }
        } 
        props.onCancel();    
    }

    return (
        <React.Fragment>
            <div className='delete-event-modal-root'>
                <div id='wrapper'>
                    <div id='delete-box'>
                        <FormLabel id='modal-name'>Are you sure you want to delete this event?</FormLabel>
                        <FormLabel id='modal-text'>All of the data of this entry will be permanently erased </FormLabel>
                        <div>
                            <Button id='cancel-btn' onClick={props.onCancel}>Cancel</Button>
                            <Button id='delete-btn' onClick={onDelete}>Delete</Button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default DeleteEventModal;
