// Copyright © 2021 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Hidden,
  IconButton,
} from '@material-ui/core';
import clsx from 'clsx';
import CubeOutlineIcon from 'mdi-react/CubeOutlineIcon';
import TextBoxCheckOutlineIcon from 'mdi-react/TextBoxCheckOutlineIcon';
import ViewDashboardOutlineIcon from 'mdi-react/ViewDashboardOutlineIcon';
import MessageTextIcon from 'mdi-react/MessageTextIcon';
import CogOutlineIcon from 'mdi-react/CogOutlineIcon';
import WebIcon from 'mdi-react/WebIcon';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import { MdiReactIconComponentType } from 'mdi-react';
import { NavDrawer } from './NavDrawer';
import { ReactComponent as LogoIconSVG } from '../../svg/ff-logo-symbol-white.svg';

export const NAVOPEN_LOCALSTORAGE_KEY = 'ff:navopen';
const drawerWidth = 220;

type Props = {
  navigationOpen: boolean;
  setNavigationOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Navigation: React.FC<Props> = ({
  navigationOpen,
  setNavigationOpen,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const history = useHistory();
  const { pathname } = useLocation();
  const relpath = pathname.replace(/^\//, '');

  const handleOpenClose = () => {
    window.localStorage.setItem(
      NAVOPEN_LOCALSTORAGE_KEY,
      Boolean(!navigationOpen).toString()
    );
    setNavigationOpen(!navigationOpen);
  };

  const icons: { [name: string]: MdiReactIconComponentType } = {
    dashboard: ViewDashboardOutlineIcon,
    network: WebIcon,
    messages: MessageTextIcon,
    data: CubeOutlineIcon,
    transactions: TextBoxCheckOutlineIcon,
    settings: CogOutlineIcon,
  };

  const navItem = (
    name: string,
    isDefault?: boolean,
    clearQueryParams?: boolean
  ) => {
    const Icon = icons[name];
    const isActive = relpath.startsWith(name) || (isDefault && !relpath);

    return (
      <ListItem
        className={clsx(classes.menuItem, isActive && classes.highlightedItem)}
        button
        onClick={() => {
          history.push(
            isDefault
              ? '/' + history.location.search
              : `/${name}` + history.location.search
          );
          if (isMobile) setNavigationOpen(false);
          if (clearQueryParams) {
          }
        }}
      >
        <ListItemIcon
          classes={{
            root: classes.closerText,
          }}
        >
          <Icon className={isActive ? classes.highlightedIcon : classes.icon} />
        </ListItemIcon>
        {navigationOpen ? (
          <ListItemText
            primaryTypographyProps={{
              noWrap: true,
              className: classes.matchTabs,
            }}
            primary={t(name)}
          />
        ) : undefined}
      </ListItem>
    );
  };

  const drawerContent = (
    <>
      <Box className={classes.logoContainer}>
        <IconButton size="small" onClick={handleOpenClose}>
          <LogoIconSVG className={classes.logo} />
        </IconButton>
      </Box>
      <List>
        {navItem('dashboard', true)}
        {/* {navItem('network')} */}
        {navItem('messages')}
        {navItem('data')}
        {navItem('transactions')}
        {/* {navItem('settings')} */}
      </List>
    </>
  );

  return (
    <>
      <Hidden smDown implementation="js">
        <NavDrawer
          open={navigationOpen}
          setOpen={setNavigationOpen}
          setIsMobile={setIsMobile}
        >
          {drawerContent}
        </NavDrawer>
      </Hidden>
      <Hidden mdUp implementation="js">
        <NavDrawer
          open={navigationOpen}
          setOpen={setNavigationOpen}
          setIsMobile={setIsMobile}
          isMobile
        >
          {drawerContent}
        </NavDrawer>
      </Hidden>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  logo: {
    width: 49,
    height: 50,
  },
  fullLogo: {
    width: 140,
  },
  logoContainer: {
    textAlign: 'center',
  },
  menuItem: {
    height: 50,
  },
  closerText: {
    minWidth: 40,
  },
  matchTabs: {
    fontWeight: 'lighter',
    fontSize: 16,
  },
  highlightedIcon: {
    color: theme.palette.text.primary,
  },
  icon: {
    color: theme.palette.action.disabled,
  },
  highlightedItem: {
    backgroundColor: theme.palette.background.default,
  },
}));
