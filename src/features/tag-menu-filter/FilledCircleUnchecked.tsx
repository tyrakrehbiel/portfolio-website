import *  as React from 'react';

import './_YearTagMenuFilter.scss';

interface Props {
    color: string;
}

const FilledCircleUnchecked:React.FC<Props> = props => {
    return(
        <div className='filled-circle-unchecked' style={{backgroundColor: props.color }}></div>
    )
}

export default FilledCircleUnchecked;