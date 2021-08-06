import * as React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import {
    TextField,
    Grid,
    Button,
    Select,
    MenuItem,
    Card,
    CardContent
} from '@material-ui/core'
import { EntryField } from '../../@types';
import './_FullEvent.scss';

interface Props {
    fieldList: EntryField[];
    setFieldString: (fieldList: string) => void;
    numRows: number;
}
const EventFields: React.FC<Props> = ({ fieldList, numRows, setFieldString: setFieldList }) => {
    
    const [fields, setFields] = React.useState<EntryField[]>([]);
    const [open, setDialogOpen] = React.useState(false);
    const [fieldIndex, setFieldIndex] = React.useState(0);
    const [newField, setNewField] = React.useState<EntryField>({
        body: '',
        type: ''
    })

    React.useEffect(() => {

        setFields(fieldList)

    }, [fieldList]);

    const handleFieldChange = (event: React.ChangeEvent<{ value: unknown }>, field: EntryField, index: number, name: keyof EntryField) => {
        const newFields = fields;
        newFields[index] = { ...field, [name]: event.target.value };
        setFieldList(JSON.stringify(newFields));
    }

    const deleteField = (index: number) => {
        const newFields = fields;
        newFields.splice(index, 1);
        setFieldList(JSON.stringify(newFields));
        setDialogOpen(false)
        setFieldIndex(-1);
    }

    const addField = () => {
        const newFields = fields;
        newFields.push(newField);
        setFieldList(JSON.stringify(newFields));
        setNewField({
            body: '',
            type: ''
        })
    };

    // Currently this always returns 'text'
    const fieldType = () => {
        if (newField.type === 'Email') return 'email';
        if (newField.type === 'Link') return 'url';
        return 'text';
    }

    return (
        <>
            {
                fields.map((field, index) => {
                    return (
                        <React.Fragment key={index}>  
                            <Card className='field-card' elevation={5}>
                                <CardContent>
                                    <div className='field-card-grid'>
                                        <div id='type-select'>
                                            <Select label={field.type} value={field.type} onChange={(e) => handleFieldChange(e, field, index, 'type')}>
                                                <MenuItem value=''><em>None</em></MenuItem>
                                                <MenuItem value={'Text'}>Text</MenuItem>
                                                <MenuItem value={'Email'}>Email</MenuItem>
                                                <MenuItem value={'Link'}>Link</MenuItem>
                                            </Select>
                                        </div>
                                        <Button id={'delete-field-btn'} onClick={() => deleteField(index)}>   <DeleteIcon /> </Button>
                                        <div id='field-content'>
                                            {fieldType() === 'text' &&
                                                <TextField id='field-text' multiline required rows={numRows} fullWidth={true} value={field.body} onChange={(e) => handleFieldChange(e, field, index, 'body')}/>
                                            }
                                            {fieldType() === 'email' &&
                                                <TextField type='email' multiline rows={7} fullWidth={true} value={field.body} onChange={(e) => handleFieldChange(e, field, index, 'body')}/>
                                            }
                                            {fieldType() === 'url' &&
                                                <TextField type='url' multiline rows={7} fullWidth={true} value={field.body} onChange={(e) => handleFieldChange(e, field, index, 'body')}/>                                         
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </React.Fragment>
                    )
                }
                )
            }
            
            <Card elevation={5}>
                <CardContent>
                    <Button onClick={() => addField()} endIcon={<AddIcon />}>Add New Field</Button>
                </CardContent>
            </Card>
            
        </>
    )

}
export default EventFields;
