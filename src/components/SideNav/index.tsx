import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HelpIcon from '@material-ui/icons/Help';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import GridOnIcon from '@material-ui/icons/GridOn';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function TemporaryDrawer() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = () => (
    <div
      // className={clsx(classes.list, {
      //   [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      // })}
      role="presentation"
      onClick={toggleDrawer('left', false)}
      onKeyDown={toggleDrawer('left', false)}
    >
      <List>
        <ListItem button key='Information'>
          <ListItemIcon><HelpIcon></HelpIcon></ListItemIcon>
          <ListItemText primary='Information' />
        </ListItem>
        <ListItem button key='Load Floor Plan (PNG/JPG)'>
          <ListItemIcon><AddPhotoAlternateIcon></AddPhotoAlternateIcon></ListItemIcon>
          <ListItemText primary='Load Floor Plan (PNG/JPG)' />
        </ListItem>
        <ListItem button key='Load Video File (MP4)'>
          <ListItemIcon><VideoCallIcon></VideoCallIcon></ListItemIcon>
          <ListItemText primary='Load Video File (MP4)' />
        </ListItem>
        <ListItem button key='Save Movement File (CSV)'>
          <ListItemIcon><GridOnIcon></GridOnIcon></ListItemIcon>
          <ListItemText primary='Save Movement File (CSV)' />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div>
      <React.Fragment>
        <Button onClick={toggleDrawer('left', true)}><MenuIcon></MenuIcon></Button>
        <Drawer anchor='left' open={state['left']} onClose={toggleDrawer('left', false)}>
          {list()}
        </Drawer>
      </React.Fragment>

  </div>
    // <div>
    //   {(['left', 'right', 'top', 'bottom'] as Anchor[]).map((anchor) => (
    //     <React.Fragment key={anchor}>
    //       <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
    //       <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
    //         {list(anchor)}
    //       </Drawer>
    //     </React.Fragment>
    //   ))}
    // </div>
  );
}