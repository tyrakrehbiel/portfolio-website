import { useState } from 'react';

// Added to fix return type missing warning
interface useModalState {
    isShown: boolean,
    toggle: (() => void)
}

export const useModal = (): useModalState => {
    const [isShown, setIsShown] = useState<boolean>(false);
    const toggle = () => setIsShown(!isShown);
    return {
        isShown,
        toggle,
    };
};