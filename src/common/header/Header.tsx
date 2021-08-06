import * as React from 'react';
import {
    AppBar,
    Badge,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Modal,
    Toolbar,
    Typography
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import MarkunreadMailboxIcon from '@material-ui/icons/MarkunreadMailbox';

import fullLogo from '../../media/logo/full-logo.svg';

import { Link, LinkProps, useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearToken } from '../../store/loginSlice';
import './_Header.scss';
import { Attendee, Entry } from '../../@types';
import { useAppSelector } from '../../store/hooks';
import { getEntryById } from '../../axios/entries';
import { getInvitesByEmail, updateAttendee } from '../../axios/attendee';

import InvitationPreview from './invitation-preview/InvitationPreview';
import { addUserEntry } from '../../axios/user';

const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
    (props, ref) => <Link innerRef={ref as (React.Ref<HTMLAnchorElement> | undefined)} {...props} />
);

interface Invite {
    attendee: Attendee,
    entry: Entry
}

const Header: React.FC = () => {
    const history = useHistory();
    const dispatch = useAppDispatch();

    const userId = useAppSelector(store => store.user.user.id);
    const userEmail = useAppSelector(store => store.user.user.email);

    const [accountAnchor, setAccountAnchor] = React.useState<null | HTMLElement>(null);
    const [accountOpen, setAccountOpen] = React.useState<boolean>(false);

    const [inviteOpen, setInviteOpen] = React.useState<boolean>(false);
    const [invitations, setInvitations] = React.useState<Invite[]>([]);
    const [preview, setPreview] = React.useState<boolean>(false);
    const [inviteEntry, setInviteEntry] = React.useState<Entry>(
        {
            id: undefined,
            startDateTime: '',
            endDateTime: '',
            description: '',
            location: '',
            tagIds: [],
            imageStoreIds: [],
            recurrenceId: undefined,
            title: '',
            fieldList: '',
            primaryTagId: undefined,
            entryType: 'Journal'
        });
    const [notifications, setNotifications] = React.useState(0);


    React.useEffect(() => {
        (async () => {
            const ats = (await getInvitesByEmail(userEmail)).data;
            // display newest invites first and trim to reasonable number
            // should eventually only display week old responded invites and all no response invites
            ats.reverse();

            const t: Invite[] = [];
            ats.forEach(async (a: Attendee) => {
                const inv: Invite = {
                    attendee: a,
                    entry: (await getEntryById(a.entryId)).data
                }
                if (a.response === 'SENT') {
                    setNotifications(notifications => notifications+1);
                    t.unshift(inv);
                }
                else if (t.length < 15) {
                    // only display responded invites if < 15 total being displayed
                    t.push(inv)
                }
            });
            setInvitations(t);
            
        })()

    }, [])

    const handleLogout = () => {
        setAccountOpen(false);
        dispatch(clearToken());
        localStorage.clear();
        history.push('/login');
    }

    const handleProfile = () => {
        setAccountOpen(false);
        history.push('/profile');
    }

    const handleTags = () => {
        setAccountOpen(false);
        history.push('/tags');
    }

    const handleJournal = () => {
        setAccountOpen(false);
        history.push('/journal');
    }

    // account menu
    const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAccountAnchor(event.currentTarget);
        setAccountOpen(true);
    };

    const handleAccountClose = () => {
        setAccountOpen(false);
        setAccountAnchor(null);
    };

    // invite menu
    const handleInviteOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAccountAnchor(event.currentTarget);
        setInviteOpen(true);
    };

    // close invite
    const handleInviteClose = () => {
        setInviteOpen(false);
        setAccountAnchor(null);
    };

    // show event
    const showEvent = (v: number | undefined) => {
        setInviteEntry(invitations.filter(e => e.entry.id === v)[0].entry)
        setPreview(true)
    }

    const accountMenu = (
        <Menu
            anchorEl={accountAnchor}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={'account-menu'}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={accountOpen}
            onClose={handleAccountClose}
            onMouseLeave={handleAccountClose}
        >
            <MenuItem color="inherit" onClick={handleProfile}>My Profile</MenuItem>
            <MenuItem color="inherit" onClick={handleTags}>My Tags</MenuItem>
            <MenuItem color="inherit" onClick={handleJournal}>My Journals</MenuItem>
            <MenuItem color="inherit" onClick={handleLogout} >Logout</MenuItem>

        </Menu>

    );

    const invitationMenu = (
        <Menu
            anchorEl={accountAnchor}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            id={'invitation-menu'}
            keepMounted
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={inviteOpen}
            onClose={handleInviteClose}
            onMouseLeave={handleInviteClose}
            style={{maxHeight: 300}}
            getContentAnchorEl={undefined}
        >
            {invitations.length==0 && <MenuItem>
                <Typography>You do not have any event invites</Typography>
            </MenuItem>}
            {invitations.map(e => {
                return <MenuItem key={`tag-${e.attendee.id}`} color="inherit"> Invitation for: {e.entry.title}
                    {(!(e.attendee.response === 'ACCEPT' || e.attendee.response === 'DECLINE') &&
                        <Button variant='outlined' className={'need-response'} onClick={() => showEvent(e.entry.id)}><b> RESPOND </b></Button>)
                        || (e.attendee.response === 'ACCEPT' && <div className='accepted'> ACCEPTED </div>)
                        || (e.attendee.response === 'DECLINE' && <div className='declined'> DECLINED </div>)
                    }

                </MenuItem>
            })}


        </Menu>

    );
    const closeInviteModal = () => {
        setPreview(false)
        setInviteEntry({
            id: undefined,
            startDateTime: '',
            endDateTime: '',
            description: '',
            location: '',
            tagIds: [],
            imageStoreIds: [],
            recurrenceId: undefined,
            title: '',
            fieldList: '',
            primaryTagId: undefined,
            entryType: 'Journal'
        });
    }

    return (
        <AppBar className='header-bar app-bar' position='static'>
            <Toolbar className='tool-bar'>
                <Link to='/year'>
                    <img src={fullLogo} className='logo' />
                </Link>
                <div>
                    <Badge 
                        badgeContent={notifications} 
                        color='primary' 
                        overlap='circular' 
                    >
                        <IconButton aria-label='invite' onClick={handleInviteOpen}>
                            <MarkunreadMailboxIcon className='invite-icon' />
                        </IconButton>
                    </Badge>


                    <IconButton aria-label='profile' onClick={handleAccountOpen}>
                        <PersonIcon className='person-icon' />
                    </IconButton>

                </div>
                {accountMenu}
                {invitationMenu}

                {preview &&
                    <Modal
                        open={preview}
                        onClose={closeInviteModal}
                        className="modal-form"
                    >
                        <InvitationPreview
                            preview={inviteEntry}
                            setResponse={async (resp:boolean) => {
                                if(userId && inviteEntry.id){
                                    if (resp){
                                        addUserEntry(userId, inviteEntry.id);
                                    }
                                    const atten = invitations.filter(e => e.entry.id === inviteEntry.id)[0].attendee
                                    atten.response = (resp ? 'ACCEPT' : 'DECLINE')
                                    updateAttendee(atten);
                                    setNotifications(notifications => notifications-1);
                                }
                                window.location.reload();
                            }}
                        />
                    </Modal>}
            </Toolbar>
        </AppBar>
    )
};

AdapterLink.displayName = 'AdapterLink';

export default Header;
