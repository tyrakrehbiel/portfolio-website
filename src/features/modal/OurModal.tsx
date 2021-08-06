import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import './_OurModal.scss'

export interface ModalProps {
    isShown: boolean;
    hide: () => void;
    modalContent: JSX.Element;
}
export const OurModal: FunctionComponent<ModalProps> = ({
    isShown,
    //hide,
    modalContent
}) => {
    const modal = (
        <React.Fragment>
            <div id='backdrop'></div>
            <div>
                <div>{modalContent}</div>
            </div>
            
        </React.Fragment>
    );
    return isShown ? ReactDOM.createPortal(modal, document.body) : null;
};
