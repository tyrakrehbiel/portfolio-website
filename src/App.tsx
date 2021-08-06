import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import FullTagList from './features/full-tag-list/FullTagList';
// import QuickCreateTag from './features/quick-create-tag/QuickCreateTag';
import './App.css';
import './index.scss'
import { Switch, Route, Redirect } from 'react-router-dom';

import DayCalendar from './features/day-calendar/DayCalendar';
import FullEvent from './features/full-event/FullEvent';
import JournalGallery from './features/full-journal/JournalGallery';
import CreateJournal from './features/create-edit-journal/CreateJournal';
import EditJournal from './features/create-edit-journal/EditJournal';
import LoginRegisterContainer from './features/login-register/LoginRegisterContainer';
import MonthCalendar from './features/month-calendar/MonthCalendar';
import UserProfile from './features/user-profile/UserProfile';
import UpdateProfile from './features/user-profile/UpdateProfile';
import WeekCalendar from './features/week-calendar/WeekCalendar';
import YearCalendar from './features/year-calendar/YearCalendar';
import NotFound from './common/routes/NotFound';
import Header from './common/header/Header';
//import ImportEvents from './features/import-events/ImportEvents';

import ProtectedRoute from './common/routes/ProtectedRoute'

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Switch>
                <Redirect path="/" exact to={{ pathname: '/login', state: { from: '/' } }} />
                <Route exact path='/login' render={(props) => (
                    <LoginRegisterContainer {...props} isLoginAttempt={true} />
                )} />
                <Route exact path='/register' render={(props) => (
                    <LoginRegisterContainer {...props} isLoginAttempt={false} />
                )} />
                <>
                    <Header />
                    <Switch>
                        <ProtectedRoute exact path='/profile' component={UserProfile} />
                        <ProtectedRoute exact path='/updateProfile' component={UpdateProfile} />
                        <ProtectedRoute exact path='/year' component={YearCalendar} />
                        <ProtectedRoute exact path='/month' component={MonthCalendar} />
                        <ProtectedRoute exact path='/week' component={WeekCalendar} />
                        <ProtectedRoute exact path='/day' component={DayCalendar} />
                        <ProtectedRoute exact path='/event/:eventId' component={FullEvent} />
                        <ProtectedRoute exact path='/journal' component={JournalGallery} />
                        <ProtectedRoute exact path='/journal/new' component={CreateJournal} />
                        <ProtectedRoute exact path='/journal/edit/:entryId' component={EditJournal} />
                        <ProtectedRoute exact path='/tags' component={FullTagList} />
                        <ProtectedRoute exact path='/tags/:userId' component={FullTagList} />
                        {/*<ProtectedRoute exact path='/upload' component={FileUpload} />*/}
                        {/*<ProtectedRoute exact path='/import' component={ImportEvents} />*/}
                        <Route component={NotFound} />
                    </Switch>
                </>
            </Switch>
        </>
    );
};

export default App;
