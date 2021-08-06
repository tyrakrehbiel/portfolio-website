import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box, Divider, Button } from '@material-ui/core';

import './_CustomButtonGroup.scss';

interface ToggleButton {
    name: string,
    to: string,
    isSelected?: boolean,
}

interface Props {
    buttons: ToggleButton[]
}

//placing in separate component to improve reusabilitiy/flexability of component
const CustomButtonGroup: React.FC<Props> = props => {

    return (
        <Box display='flex' alignItems='center' className='custom-button-group toggle '>
            {props.buttons.map((button, idx) => (
                <Box
                    key={`view-toggle-button-${button.name}`}
                    display='flex'
                >
                    <Button 
                        className={'view-toggle-button ' + (button.isSelected && 'selected')} 
                        component={Link}
                        to={button.to}
                    >
                        {button.name}
                    </Button>
                    {idx < (props.buttons.length - 1) &&
                        <Divider orientation='vertical' flexItem />
                    }
                </Box>
            ))}
        </Box>
    )
}

export default CustomButtonGroup;

//